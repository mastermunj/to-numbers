/**
 * ToNumbers - Convert words to numbers
 * The reverse of the to-words package
 */
import { ConverterOptions, ToNumbersOptions, ParseResult, ParserLocaleConfig, LocaleInterface, ConstructorOf } from './types';
import LOCALES from './locales';
export { LOCALES };
export declare const DefaultConverterOptions: ConverterOptions;
export declare const DefaultToNumbersOptions: ToNumbersOptions;
export declare class ToNumbers {
    private options;
    private locale;
    private parserConfig;
    constructor(options?: ToNumbersOptions);
    /**
     * Get the locale class for the current locale code
     */
    getLocaleClass(): ConstructorOf<LocaleInterface>;
    /**
     * Get the locale instance
     */
    getLocale(): InstanceType<ConstructorOf<LocaleInterface>>;
    /**
     * Get the parser configuration for the current locale
     */
    getParserConfig(): ParserLocaleConfig;
    /**
     * Tokenize input based on locale settings
     */
    protected getTokens(words: string): string[];
    /**
     * Convert words to a number
     */
    convert(words: string, options?: ConverterOptions): number;
    /**
     * Parse words and return detailed result
     */
    parse(words: string, options?: ConverterOptions): ParseResult;
    /**
     * Parse a plain number (not currency)
     */
    protected parseNumber(words: string): number;
    /**
     * Parse currency format
     */
    protected parseCurrency(words: string, options: ConverterOptions): ParseResult;
    /**
     * Parse integer tokens into a number
     * Uses recursive descent for scale words
     */
    protected parseIntegerTokens(tokens: string[], config: ParserLocaleConfig): number;
    /**
     * Parse decimal tokens (digits after decimal point)
     * Returns both the numeric value and the number of decimal places
     */
    protected parseDecimalTokens(tokens: string[], config: ParserLocaleConfig): {
        value: number;
        places: number;
    };
    /**
     * Check if all tokens are single digit numbers (0-9)
     */
    protected isAllSingleDigits(tokens: string[], config: ParserLocaleConfig): boolean;
    /**
     * Combine integer and decimal parts
     */
    protected combineIntegerAndDecimal(integerPart: number, decimalPart: number, decimalPlaces: number): number;
    /**
     * Find the index of a point/decimal separator
     */
    protected findPointIndex(tokens: string[], config: ParserLocaleConfig): number;
    /**
     * Find the index of a currency unit in tokens
     */
    protected findCurrencyUnitIndex(tokens: string[], unitWords: string[]): number;
    /**
     * Find the highest scale word in tokens
     */
    protected findHighestScale(tokens: string[], config: ParserLocaleConfig): {
        index: number;
        value: number;
    } | null;
    /**
     * Sum simple number words (no scale words)
     */
    protected sumSimpleNumbers(tokens: string[], config: ParserLocaleConfig): number;
    /**
     * Check if input is valid
     */
    isValidInput(input: string | null | undefined): boolean;
}
