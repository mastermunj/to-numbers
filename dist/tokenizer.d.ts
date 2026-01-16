/**
 * Tokenizer utility for parsing word-based number strings
 */
export interface TokenizerOptions {
    /**
     * Whether matching is case-sensitive
     */
    caseSensitive: boolean;
    /**
     * Whether to trim concatenated words (e.g., Korean)
     */
    trim: boolean;
    /**
     * Word map to check if hyphenated words should be kept together
     */
    wordMap?: Map<string, number>;
}
/**
 * Normalize a word for consistent matching
 */
export declare function normalizeWord(word: string, caseSensitive?: boolean): string;
/**
 * Tokenize a string of words into individual tokens
 * Handles various separators: spaces, hyphens, commas, and special cases
 * Also handles multi-word phrases from the word map
 */
export declare function tokenize(input: string, options?: Partial<TokenizerOptions>): string[];
/**
 * Clean and normalize input string
 */
export declare function cleanInput(input: string): string;
/**
 * Check if a token is a number word in the given map
 */
export declare function isNumberWord(token: string, wordMap: Map<string, number>): boolean;
/**
 * Tokenize a concatenated string (no spaces) using longest-match algorithm
 * Used for languages like Korean where words are joined together
 */
export declare function tokenizeConcatenated(input: string, wordMap: Map<string, number>, caseSensitive?: boolean, additionalWords?: string[]): string[];
/**
 * Get all variations of a word (for fuzzy matching in the future)
 */
export declare function getWordVariations(word: string): string[];
