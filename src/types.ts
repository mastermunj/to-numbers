/**
 * Reverse mapping: word → number
 */
export type WordNumberMap = Map<string, number>;

/**
 * Parse result with detailed information
 */
export interface ParseResult {
  value: number;
  isCurrency: boolean;
  isNegative: boolean;
  isOrdinal?: boolean;
  currencyInfo?: {
    mainAmount: number;
    fractionalAmount: number;
    currencyName?: string;
    fractionalUnitName?: string;
  };
}

/**
 * Currency options for parsing
 */
export interface CurrencyOptions {
  name: string;
  plural: string;
  singular?: string;
  symbol: string;
  numberSpecificForms?: Record<number, string>;
  fractionalUnit: {
    name: string;
    plural: string;
    singular?: string;
    symbol: string;
    numberSpecificForms?: Record<number, string>;
  };
}

/**
 * Converter options for parsing
 */
export type ConverterOptions = {
  // Force currency parsing mode (true), force plain number mode (false), or auto-detect (undefined)
  currency?: boolean;
  // Override currency options for parsing
  currencyOptions?: Partial<CurrencyOptions>;
};

/**
 * Main options for ToNumbers constructor
 */
export type ToNumbersOptions = {
  localeCode?: string;
  converterOptions?: ConverterOptions;
};

/**
 * Constructor type helper
 */
export interface ConstructorOf<T> {
  new (...args: unknown[]): T;
}

/**
 * Number word mapping (same as to-words)
 * Supports bigint for extremely large numbers
 */
export type NumberWordMap = {
  number: number | bigint;
  value: string | [string, string];
  singularValue?: string;
};

/**
 * Locale configuration for parsing
 */
export interface ParserLocaleConfig {
  /**
   * Reverse lookup: word → number
   */
  wordToNumber: WordNumberMap;

  /**
   * Scale words (hundred, thousand, million, etc.)
   */
  scaleWords: Set<number>;

  /**
   * Words that imply a coefficient of 2 when appearing alone as a scale word
   * (e.g., Italian "Milioni" = 2 million, but "Dieci Milioni" = 10 million)
   */
  impliedDualWords: Set<string>;

  /**
   * Words that represent the number 1 (used to detect postfix qualifiers like
   * Swahili "Mia Moja" = hundred one = 100, where "Moja" shouldn't add 1)
   */
  oneWords: Set<string>;

  /**
   * Whether the locale uses postfix "one" qualifiers for scale words.
   * In Swahili, "Mia Moja" (hundred one) = 100, not 101.
   * This is detected by the presence of "<scale> <one>" patterns in exactWordsMapping.
   */
  usesPostfixOne: boolean;

  /**
   * Text markers for parsing
   */
  texts: {
    and: string[];
    minus: string[];
    point: string[];
    only: string[];
  };

  /**
   * Currency recognition words
   */
  currency: {
    mainUnit: string[];
    fractionalUnit: string[];
  };

  /**
   * Whether matching is case-sensitive
   */
  caseSensitive: boolean;

  /**
   * Whether words are concatenated without spaces (e.g., Korean)
   */
  trim: boolean;

  /**
   * Split word used between compound numbers (e.g., "and" in some locales)
   */
  splitWord?: string;

  /**
   * Ordinal word to number mapping (e.g., "first" → 1, "second" → 2)
   */
  ordinalWordToNumber: WordNumberMap;

  /**
   * Ordinal suffix for suffix-based ordinals (e.g., "th" for "millionth")
   */
  ordinalSuffix?: string;

  // ============ CACHED/PRECOMPUTED FIELDS FOR PERFORMANCE ============

  /**
   * Pre-sorted phrases for tokenization (sorted by word count desc, then length desc)
   * Cached to avoid re-sorting on every tokenize call
   */
  sortedPhrases: string[];

  /**
   * Pre-filtered multi-word phrases only (for slow path in tokenizer)
   * Excludes single-word entries for faster iteration
   */
  multiWordPhrases: string[];

  /**
   * Pre-computed special words for concatenated tokenization
   * Includes minus, point, and, only, currency units, and ordinal words
   */
  specialWords: string[];

  /**
   * Pre-sorted words for concatenated tokenization (sorted by length desc)
   * Combines wordToNumber keys + specialWords, sorted for longest-match
   */
  sortedConcatenatedWords: string[];

  /**
   * Set of 'and' words for O(1) lookup (instead of array.includes)
   */
  andWordsSet: Set<string>;

  /**
   * Pre-computed Set of main currency unit words for O(1) lookup
   */
  mainUnitSet: Set<string>;

  /**
   * Pre-computed Set of fractional currency unit words for O(1) lookup
   */
  fractionalUnitSet: Set<string>;

  /**
   * Pre-split multi-word main currency units (each array is the split words)
   */
  mainUnitMultiWord: string[][];

  /**
   * Pre-split multi-word fractional currency units
   */
  fractionalUnitMultiWord: string[][];
}

/**
 * Plural form variants for Arabic-style languages
 */
export interface PluralFormVariants {
  dual?: string;
  paucal?: string;
  plural?: string;
}

/**
 * Original locale config from to-words (for reference/adaptation)
 */
export interface OriginalLocaleConfig {
  currency: CurrencyOptions;
  texts: {
    and: string;
    minus: string;
    only: string;
    point: string;
  };
  numberWordsMapping: NumberWordMap[];
  exactWordsMapping?: NumberWordMap[];
  ordinalWordsMapping?: NumberWordMap[];
  ordinalExactWordsMapping?: NumberWordMap[];
  ordinalSuffix?: string;
  namedLessThan1000?: boolean;
  splitWord?: string;
  ignoreZeroInDecimals?: boolean;
  decimalLengthWordMapping?: Record<number, string>;
  ignoreOneForWords?: string[];
  pluralMark?: string;
  pluralWords?: string[];
  pluralForms?: Record<number, PluralFormVariants>;
  trim?: boolean;
  onlyInFront?: boolean;
  noSplitWordAfter?: string[];
  paucalConfig?: {
    min: number;
    max: number;
  };
}

/**
 * Locale interface for parser
 */
export interface LocaleInterface {
  config: OriginalLocaleConfig;
}

/**
 * Alias for backward compatibility with locale files
 */
export type LocaleConfig = OriginalLocaleConfig;
