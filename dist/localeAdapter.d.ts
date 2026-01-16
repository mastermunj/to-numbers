/**
 * Locale Adapter - Builds parser locale config from original to-words locale
 */
import { OriginalLocaleConfig, ParserLocaleConfig, WordNumberMap } from './types';
/**
 * Build a reverse word-to-number mapping from the original locale config
 */
export declare function buildWordToNumberMap(config: OriginalLocaleConfig, caseSensitive?: boolean): WordNumberMap;
/**
 * Extract scale word values from the word-to-number map
 */
export declare function extractScaleWords(wordToNumber: WordNumberMap): Set<number>;
/**
 * Build currency word lists from locale config
 */
export declare function buildCurrencyWords(config: OriginalLocaleConfig, caseSensitive?: boolean): {
    mainUnit: string[];
    fractionalUnit: string[];
};
/**
 * Build complete parser locale config from original to-words locale
 */
export declare function buildParserLocaleConfig(config: OriginalLocaleConfig, caseSensitive?: boolean): ParserLocaleConfig;
