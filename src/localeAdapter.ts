/**
 * Locale Adapter - Builds parser locale config from original to-words locale
 */

import { OriginalLocaleConfig, ParserLocaleConfig, PluralFormVariants, WordNumberMap } from './types';
import { normalizeWord } from './tokenizer';

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
  1000000000, // Billion
  1000000000000, // Trillion
  1000000000000000, // Quadrillion
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
      wordToNumber.set(normalized, mapping.number);
    }

    // Also add singularValue if present
    if (mapping.singularValue) {
      const normalized = normalizeWord(mapping.singularValue, caseSensitive);
      wordToNumber.set(normalized, mapping.number);
    }
  }

  // Process exactWordsMapping (special cases like "One Hundred")
  if (config.exactWordsMapping) {
    for (const mapping of config.exactWordsMapping) {
      const words = extractWordValue(mapping.value);
      for (const word of words) {
        const normalized = normalizeWord(word, caseSensitive);
        wordToNumber.set(normalized, mapping.number);
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
      // Dual form represents 2x the base number (e.g., ألفان = 2000)
      if (pluralForms.dual) {
        wordToNumber.set(normalizeWord(pluralForms.dual, caseSensitive), number * 2);
      }
      // Paucal and plural are used with explicit numbers, so they map to the base
      if (pluralForms.paucal) {
        wordToNumber.set(normalizeWord(pluralForms.paucal, caseSensitive), number);
      }
      if (pluralForms.plural) {
        wordToNumber.set(normalizeWord(pluralForms.plural, caseSensitive), number);
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
  }

  return scaleWords;
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
 * Build complete parser locale config from original to-words locale
 */
export function buildParserLocaleConfig(
  config: OriginalLocaleConfig,
  caseSensitive: boolean = false,
): ParserLocaleConfig {
  const wordToNumber = buildWordToNumberMap(config, caseSensitive);
  const scaleWords = extractScaleWords(wordToNumber);
  const currencyWords = buildCurrencyWords(config, caseSensitive);

  // Build text marker arrays (normalized)
  const texts = {
    and: config.texts.and ? [normalizeWord(config.texts.and, caseSensitive)] : [],
    minus: config.texts.minus ? [normalizeWord(config.texts.minus, caseSensitive)] : [],
    point: config.texts.point ? [normalizeWord(config.texts.point, caseSensitive)] : [],
    only: config.texts.only ? [normalizeWord(config.texts.only, caseSensitive)] : [],
  };

  return {
    wordToNumber,
    scaleWords,
    texts,
    currency: currencyWords,
    caseSensitive,
    trim: config.trim ?? false,
    splitWord: config.splitWord ? normalizeWord(config.splitWord, caseSensitive) : undefined,
  };
}
