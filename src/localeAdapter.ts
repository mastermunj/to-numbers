/**
 * Locale Adapter - Builds parser locale config from original to-words locale
 */

import { OriginalLocaleConfig, ParserLocaleConfig, PluralFormVariants, WordNumberMap } from './types.js';
import { normalizeWord } from './tokenizer.js';

/**
 * Scale values that represent multipliers (hundred and above)
 */
const SCALE_VALUES = new Set([
  100, // Hundred
  1000, // Thousand
  10000, // Wan (Korean/Chinese)
  100000, // Lakh
  1000000, // Million
  10000000, // Crore
  100000000, // Yi (Korean)
  1000000000, // Billion / Arab
  10000000000, // Ten Billion
  100000000000, // Hundred Billion / Kharab
  1000000000000, // Trillion
  10000000000000, // Ten Trillion / Neel
  100000000000000, // Hundred Trillion / Padma
  1000000000000000, // Quadrillion / Shankh
  10000000000000000, // Ten Quadrillion
]);

/**
 * Extract the word value from a NumberWordMap entry
 */
function extractWordValue(value: string | [string, string]): string[] {
  if (Array.isArray(value)) {
    // Return both forms (e.g., trailing and non-trailing forms)
    return value.filter((v) => v.length > 0);
  }
  return [value];
}

/**
 * Convert bigint to number safely (for extremely large numbers, uses MAX_SAFE_INTEGER)
 */
function toNumber(value: number | bigint): number {
  if (typeof value === 'bigint') {
    // For bigints beyond safe integer range, use the value as-is (may lose precision)
    // This is acceptable for word-to-number conversion as we mainly care about the mapping
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
      return Number.MAX_SAFE_INTEGER;
    }
    return Number(value);
  }
  return value;
}

/**
 * Build a reverse word-to-number mapping from the original locale config
 */
export function buildWordToNumberMap(config: OriginalLocaleConfig, caseSensitive: boolean = false): WordNumberMap {
  const wordToNumber: WordNumberMap = new Map();

  // Process numberWordsMapping
  for (const mapping of config.numberWordsMapping) {
    const words = extractWordValue(mapping.value);
    for (const word of words) {
      const normalized = normalizeWord(word, caseSensitive);
      // Handle multi-word values (e.g., "Twenty One")
      wordToNumber.set(normalized, toNumber(mapping.number));
    }

    // Also add singularValue if present
    if (mapping.singularValue) {
      const normalized = normalizeWord(mapping.singularValue, caseSensitive);
      wordToNumber.set(normalized, toNumber(mapping.number));
    }
  }

  // Process exactWordsMapping (special cases like "One Hundred")
  // IMPORTANT: Do NOT add multi-word phrases to the word map!
  // Multi-word phrases from exactWordsMapping are only meant for cases where that's
  // the complete expression for that number (e.g., "Mia Moja" = 100 in Swahili).
  // Adding them to the tokenizer's word map causes greedy matching issues:
  // - "Một Mijë" (Albanian: One Thousand) would prevent "Dyzet Một Mijë" from parsing
  //   correctly (should be 41 * 1000, not 40 + 1000)
  // - "Mia Moja" (Swahili: Hundred One) would prevent "Moja Mia Moja" from parsing
  //   correctly (should be 1 * 100 + 1 = 101, not 1 + 100 = 101)
  // Single-word entries are fine to add.
  if (config.exactWordsMapping) {
    for (const mapping of config.exactWordsMapping) {
      const words = extractWordValue(mapping.value);
      for (const word of words) {
        // Skip multi-word phrases entirely - they cause tokenization issues
        if (word.includes(' ')) {
          continue;
        }
        const normalized = normalizeWord(word, caseSensitive);
        wordToNumber.set(normalized, toNumber(mapping.number));
      }
    }
  }

  // Add plural mark variants if defined
  if (config.pluralMark && config.pluralWords) {
    for (const word of config.pluralWords) {
      const pluralForm = word + config.pluralMark;
      const baseNumber = wordToNumber.get(normalizeWord(word, caseSensitive));
      if (baseNumber !== undefined) {
        wordToNumber.set(normalizeWord(pluralForm, caseSensitive), baseNumber);
      }
    }
  }

  // Add pluralForms (dual, paucal, plural variants for Arabic and similar)
  if (config.pluralForms) {
    for (const [numberStr, forms] of Object.entries(config.pluralForms)) {
      const number = parseInt(numberStr, 10);
      const pluralForms = forms as PluralFormVariants;

      // Normalize all forms for comparison
      const dualNorm = pluralForms.dual ? normalizeWord(pluralForms.dual, caseSensitive) : null;
      const paucalNorm = pluralForms.paucal ? normalizeWord(pluralForms.paucal, caseSensitive) : null;
      const pluralNorm = pluralForms.plural ? normalizeWord(pluralForms.plural, caseSensitive) : null;

      // Check if dual is distinct from paucal and plural (like Arabic: ألفان vs آلاف vs ألف)
      const dualIsDistinct = dualNorm && dualNorm !== paucalNorm && dualNorm !== pluralNorm;

      // Dual form: if distinct, represents 2x the base number (e.g., ألفان = 2000)
      // If same as other forms (like Italian Milioni), just map to base
      if (dualNorm) {
        wordToNumber.set(dualNorm, dualIsDistinct ? number * 2 : number);
      }
      // Paucal and plural map to the base scale value
      if (paucalNorm) {
        wordToNumber.set(paucalNorm, number);
      }
      if (pluralNorm) {
        wordToNumber.set(pluralNorm, number);
      }
    }
  }

  return wordToNumber;
}

/**
 * Extract scale word values from the word-to-number map
 */
export function extractScaleWords(wordToNumber: WordNumberMap): Set<number> {
  const scaleWords = new Set<number>();

  for (const [, number] of wordToNumber) {
    if (SCALE_VALUES.has(number)) {
      scaleWords.add(number);
    }
    // Also recognize dual form values (2x the base scale) as scale words
    // e.g., مليونان = 2000000 (2x million), Milioni = 2000000 (Italian dual)
    if (number >= 100 && SCALE_VALUES.has(number / 2)) {
      scaleWords.add(number);
    }
  }

  return scaleWords;
}

/**
 * Extract words that imply a coefficient of 2 when appearing alone as a scale word
 * (e.g., Italian "Milioni" = 2 million when alone, but "Dieci Milioni" = 10 million)
 */
export function extractImpliedDualWords(config: OriginalLocaleConfig, caseSensitive: boolean = false): Set<string> {
  const impliedDualWords = new Set<string>();

  if (config.pluralForms) {
    for (const [, forms] of Object.entries(config.pluralForms)) {
      const pluralForms = forms as PluralFormVariants;

      // Normalize all forms for comparison
      const dualNorm = pluralForms.dual ? normalizeWord(pluralForms.dual, caseSensitive) : null;
      const paucalNorm = pluralForms.paucal ? normalizeWord(pluralForms.paucal, caseSensitive) : null;
      const pluralNorm = pluralForms.plural ? normalizeWord(pluralForms.plural, caseSensitive) : null;

      // If dual is the SAME as paucal or plural (like Italian Milioni)
      // then this word implies 2 when appearing alone
      if (dualNorm && (dualNorm === paucalNorm || dualNorm === pluralNorm)) {
        impliedDualWords.add(dualNorm);
      }
    }
  }

  return impliedDualWords;
}

/**
 * Extract words that represent the number 1
 * Used to detect postfix qualifiers like Swahili "Mia Moja" = 100
 */
export function extractOneWords(wordToNumber: Map<string, number>): Set<string> {
  const oneWords = new Set<string>();
  for (const [word, num] of wordToNumber) {
    if (num === 1 && !word.includes(' ')) {
      oneWords.add(word);
    }
  }
  return oneWords;
}

/**
 * Detect if the locale uses postfix "one" qualifiers for scale words.
 * This is detected by the presence of "<scale> <one>" patterns in exactWordsMapping
 * where the scale word comes first followed by a "one" word.
 * e.g., Swahili "Mia Moja" (hundred one) = 100
 */
export function detectUsesPostfixOne(
  config: OriginalLocaleConfig,
  scaleWords: Set<number>,
  oneWords: Set<string>,
  caseSensitive: boolean = false,
): boolean {
  if (!config.exactWordsMapping) {
    return false;
  }

  for (const mapping of config.exactWordsMapping) {
    const value = mapping.value;
    if (typeof value !== 'string' || !value.includes(' ')) {
      continue;
    }

    const parts = value.split(' ');
    if (parts.length !== 2) {
      continue;
    }

    // Check if pattern is "<scale> <one>" (scale first, one second)
    const secondPart = normalizeWord(parts[1], caseSensitive);

    // First part should be a scale word, second part should be a "one" word
    // But we need to check by the mapped number, not just the word
    // For now, check if second part is in oneWords
    if (oneWords.has(secondPart)) {
      // This locale has a "<something> <one>" pattern
      // Check if the mapped number is a scale (100, 1000, etc.)
      const num = toNumber(mapping.number);
      if (scaleWords.has(num)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Build currency word lists from locale config
 */
export function buildCurrencyWords(
  config: OriginalLocaleConfig,
  caseSensitive: boolean = false,
): { mainUnit: string[]; fractionalUnit: string[] } {
  const mainUnit: string[] = [];
  const fractionalUnit: string[] = [];

  const currency = config.currency;

  // Main currency unit words
  if (currency.name) {
    mainUnit.push(normalizeWord(currency.name, caseSensitive));
  }
  if (currency.plural) {
    mainUnit.push(normalizeWord(currency.plural, caseSensitive));
  }
  if (currency.singular) {
    mainUnit.push(normalizeWord(currency.singular, caseSensitive));
  }

  // Fractional unit words
  const fractional = currency.fractionalUnit;
  if (fractional.name) {
    fractionalUnit.push(normalizeWord(fractional.name, caseSensitive));
  }
  if (fractional.plural) {
    fractionalUnit.push(normalizeWord(fractional.plural, caseSensitive));
  }
  if (fractional.singular) {
    fractionalUnit.push(normalizeWord(fractional.singular, caseSensitive));
  }

  return { mainUnit, fractionalUnit };
}

/**
 * Build ordinal word-to-number mapping from locale config
 */
export function buildOrdinalWordToNumberMap(
  config: OriginalLocaleConfig,
  caseSensitive: boolean = false,
): WordNumberMap {
  const ordinalWordToNumber: WordNumberMap = new Map();

  // Process ordinalWordsMapping (e.g., First → 1, Second → 2)
  if (config.ordinalWordsMapping) {
    for (const mapping of config.ordinalWordsMapping) {
      const words = extractWordValue(mapping.value);
      for (const word of words) {
        const normalized = normalizeWord(word, caseSensitive);
        ordinalWordToNumber.set(normalized, toNumber(mapping.number));
      }
    }
  }

  // Process ordinalExactWordsMapping (e.g., "One Hundredth" → 100)
  // These are kept as single entries for exact matching
  if (config.ordinalExactWordsMapping) {
    for (const mapping of config.ordinalExactWordsMapping) {
      const words = extractWordValue(mapping.value);
      for (const word of words) {
        const normalized = normalizeWord(word, caseSensitive);
        ordinalWordToNumber.set(normalized, toNumber(mapping.number));
      }
    }
  }

  return ordinalWordToNumber;
}

/**
 * Build complete parser locale config from original to-words locale
 */
export function buildParserLocaleConfig(
  config: OriginalLocaleConfig,
  caseSensitive: boolean = false,
): ParserLocaleConfig {
  const wordToNumber = buildWordToNumberMap(config, caseSensitive);
  const scaleWords = extractScaleWords(wordToNumber);
  const impliedDualWords = extractImpliedDualWords(config, caseSensitive);
  const oneWords = extractOneWords(wordToNumber);
  const currencyWords = buildCurrencyWords(config, caseSensitive);
  const ordinalWordToNumber = buildOrdinalWordToNumberMap(config, caseSensitive);

  // Build text marker arrays (normalized)
  const texts = {
    and: config.texts.and ? [normalizeWord(config.texts.and, caseSensitive)] : [],
    minus: config.texts.minus ? [normalizeWord(config.texts.minus, caseSensitive)] : [],
    point: config.texts.point ? [normalizeWord(config.texts.point, caseSensitive)] : [],
    only: config.texts.only ? [normalizeWord(config.texts.only, caseSensitive)] : [],
  };

  // Detect if the locale uses postfix "one" qualifiers
  const usesPostfixOne = detectUsesPostfixOne(config, scaleWords, oneWords, caseSensitive);

  // ============ PRE-COMPUTE CACHED VALUES FOR PERFORMANCE ============

  // Pre-sort phrases for tokenization (sorted by word count desc, then length desc)
  const sortedPhrases = Array.from(wordToNumber.keys()).sort((a, b) => {
    const wordsA = a.split(/\s+/).length;
    const wordsB = b.split(/\s+/).length;
    if (wordsB !== wordsA) return wordsB - wordsA;
    return b.length - a.length;
  });

  // Pre-filter multi-word phrases only (for slow path in tokenizer)
  const multiWordPhrases = sortedPhrases.filter((phrase) => phrase.includes(' '));

  // Pre-compute special words for concatenated tokenization
  const specialWords = [
    ...texts.minus,
    ...texts.point,
    ...texts.and,
    ...texts.only,
    ...currencyWords.mainUnit,
    ...currencyWords.fractionalUnit,
    ...Array.from(ordinalWordToNumber.keys()),
  ].filter((w) => w.length > 0);

  // Pre-sort words for concatenated tokenization (sorted by length desc)
  const allConcatenatedWords = [...Array.from(wordToNumber.keys()), ...specialWords];
  const sortedConcatenatedWords = allConcatenatedWords.sort((a, b) => b.length - a.length);

  // Create Set for O(1) 'and' word lookup
  const andWordsSet = new Set(texts.and);

  // Pre-compute currency unit Sets and multi-word arrays for O(1) lookup
  const mainUnitSet = new Set<string>();
  const fractionalUnitSet = new Set<string>();
  const mainUnitMultiWord: string[][] = [];
  const fractionalUnitMultiWord: string[][] = [];

  for (const unit of currencyWords.mainUnit) {
    if (unit.includes(' ')) {
      mainUnitMultiWord.push(unit.split(' '));
    } else {
      mainUnitSet.add(unit);
    }
  }

  for (const unit of currencyWords.fractionalUnit) {
    if (unit.includes(' ')) {
      fractionalUnitMultiWord.push(unit.split(' '));
    } else {
      fractionalUnitSet.add(unit);
    }
  }

  return {
    wordToNumber,
    scaleWords,
    impliedDualWords,
    oneWords,
    usesPostfixOne,
    texts,
    currency: currencyWords,
    caseSensitive,
    trim: config.trim ?? false,
    splitWord: config.splitWord ? normalizeWord(config.splitWord, caseSensitive) : undefined,
    ordinalWordToNumber,
    ordinalSuffix: config.ordinalSuffix ? normalizeWord(config.ordinalSuffix, caseSensitive) : undefined,
    // Cached values
    sortedPhrases,
    multiWordPhrases,
    specialWords,
    sortedConcatenatedWords,
    andWordsSet,
    mainUnitSet,
    fractionalUnitSet,
    mainUnitMultiWord,
    fractionalUnitMultiWord,
  };
}
