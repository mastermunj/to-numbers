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
  currency?: boolean;
  ignoreDecimal?: boolean;
  // For currency parsing, specifies fractional precision (default: 2)
  fractionalPrecision?: number;
  // Ignore zero currency (e.g., "Zero Dollars" -> skip)
  ignoreZeroCurrency?: boolean;
  // Do not add "Only" suffix when parsing currency
  doNotAddOnly?: boolean;
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
