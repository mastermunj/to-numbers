/**
 * ToNumbers - Convert words to numbers
 * The reverse of the to-words package
 */

import {
  ConverterOptions,
  ToNumbersOptions,
  ParseResult,
  ParserLocaleConfig,
  LocaleInterface,
  ConstructorOf,
} from './types';
import { tokenize, tokenizeConcatenated, cleanInput } from './tokenizer';
import { buildParserLocaleConfig } from './localeAdapter';
import LOCALES from './locales';

export { LOCALES };

export const DefaultConverterOptions: ConverterOptions = {
  currency: false,
  ignoreDecimal: false,
  fractionalPrecision: 2,
};

export const DefaultToNumbersOptions: ToNumbersOptions = {
  localeCode: 'en-IN',
  converterOptions: DefaultConverterOptions,
};

export class ToNumbers {
  private options: ToNumbersOptions = {};
  private locale: InstanceType<ConstructorOf<LocaleInterface>> | undefined = undefined;
  private parserConfig: ParserLocaleConfig | undefined = undefined;

  constructor(options: ToNumbersOptions = {}) {
    this.options = Object.assign({}, DefaultToNumbersOptions, options);
  }

  /**
   * Get the locale class for the current locale code
   */
  public getLocaleClass(): ConstructorOf<LocaleInterface> {
    if (!(this.options.localeCode! in LOCALES)) {
      throw new Error(`Unknown Locale "${this.options.localeCode}"`);
    }
    return LOCALES[this.options.localeCode!];
  }

  /**
   * Get the locale instance
   */
  public getLocale(): InstanceType<ConstructorOf<LocaleInterface>> {
    if (this.locale === undefined) {
      const LocaleClass = this.getLocaleClass();
      this.locale = new LocaleClass();
    }
    return this.locale;
  }

  /**
   * Get the parser configuration for the current locale
   */
  public getParserConfig(): ParserLocaleConfig {
    if (this.parserConfig === undefined) {
      const locale = this.getLocale();
      this.parserConfig = buildParserLocaleConfig(locale.config, false);
    }
    return this.parserConfig;
  }

  /**
   * Tokenize input based on locale settings
   */
  protected getTokens(words: string): string[] {
    const config = this.getParserConfig();
    const cleaned = cleanInput(words);

    if (config.trim) {
      // Collect all special words that need to be recognized
      const specialWords = [
        ...config.texts.minus,
        ...config.texts.point,
        ...config.texts.and,
        ...config.texts.only,
        ...config.currency.mainUnit,
        ...config.currency.fractionalUnit,
      ].filter((w) => w.length > 0);

      // Use concatenated tokenizer for languages like Korean
      return tokenizeConcatenated(cleaned, config.wordToNumber, config.caseSensitive, specialWords);
    }

    return tokenize(cleaned, {
      caseSensitive: config.caseSensitive,
      wordMap: config.wordToNumber,
    });
  }

  /**
   * Convert words to a number
   */
  public convert(words: string, options: ConverterOptions = {}): number {
    options = Object.assign({}, this.options.converterOptions, options);

    if (!this.isValidInput(words)) {
      throw new Error(`Invalid Input "${words}"`);
    }

    if (options.currency) {
      const result = this.parseCurrency(words, options);
      return result.value;
    }

    return this.parseNumber(words);
  }

  /**
   * Parse words and return detailed result
   */
  public parse(words: string, options: ConverterOptions = {}): ParseResult {
    options = Object.assign({}, this.options.converterOptions, options);

    if (!this.isValidInput(words)) {
      throw new Error(`Invalid Input "${words}"`);
    }

    if (options.currency) {
      return this.parseCurrency(words, options);
    }

    const value = this.parseNumber(words);
    return {
      value,
      isCurrency: false,
      isNegative: value < 0,
    };
  }

  /**
   * Parse a plain number (not currency)
   */
  protected parseNumber(words: string): number {
    const config = this.getParserConfig();
    const tokens = this.getTokens(words);

    if (tokens.length === 0) {
      return 0;
    }

    // Check for negative indicator
    let isNegative = false;
    let startIndex = 0;

    if (tokens.length > 0 && config.texts.minus.includes(tokens[0])) {
      isNegative = true;
      startIndex = 1;
    }

    const numberTokens = tokens.slice(startIndex);

    // Check for decimal point
    const pointIndex = this.findPointIndex(numberTokens, config);

    let integerPart = 0;
    let decimalPart = 0;
    let decimalPlaces = 0;

    if (pointIndex === -1) {
      // No decimal point, parse as integer
      integerPart = this.parseIntegerTokens(numberTokens, config);
    } else {
      // Parse integer and decimal parts
      const integerTokens = numberTokens.slice(0, pointIndex);
      const decimalTokens = numberTokens.slice(pointIndex + 1);

      integerPart = integerTokens.length > 0 ? this.parseIntegerTokens(integerTokens, config) : 0;
      const decimalResult = this.parseDecimalTokens(decimalTokens, config);
      decimalPart = decimalResult.value;
      decimalPlaces = decimalResult.places;
    }

    let result = integerPart;
    if (pointIndex !== -1 && decimalPlaces > 0) {
      result = this.combineIntegerAndDecimal(integerPart, decimalPart, decimalPlaces);
    }

    return isNegative ? -result : result;
  }

  /**
   * Parse currency format
   */
  protected parseCurrency(words: string, options: ConverterOptions): ParseResult {
    const config = this.getParserConfig();
    const tokens = this.getTokens(words);

    if (tokens.length === 0) {
      return {
        value: 0,
        isCurrency: true,
        isNegative: false,
        currencyInfo: {
          mainAmount: 0,
          fractionalAmount: 0,
        },
      };
    }

    // Check for negative indicator
    let isNegative = false;
    let startIndex = 0;

    if (tokens.length > 0 && config.texts.minus.includes(tokens[0])) {
      isNegative = true;
      startIndex = 1;
    }

    let numberTokens = tokens.slice(startIndex);

    // Remove "only" suffix if present
    if (numberTokens.length > 0 && config.texts.only.includes(numberTokens[numberTokens.length - 1])) {
      numberTokens = numberTokens.slice(0, -1);
    }

    // Find currency unit position
    const mainUnitIndex = this.findCurrencyUnitIndex(numberTokens, config.currency.mainUnit);
    const fractionalUnitIndex = this.findCurrencyUnitIndex(numberTokens, config.currency.fractionalUnit);

    let mainAmount = 0;
    let fractionalAmount = 0;

    if (mainUnitIndex === -1 && fractionalUnitIndex === -1) {
      // No currency units found, treat as plain number
      mainAmount = this.parseIntegerTokens(numberTokens, config);
    } else if (mainUnitIndex !== -1 && fractionalUnitIndex === -1) {
      // Only main currency unit
      const mainTokens = numberTokens.slice(0, mainUnitIndex);
      mainAmount = this.parseIntegerTokens(mainTokens, config);
    } else if (mainUnitIndex === -1 && fractionalUnitIndex !== -1) {
      // Only fractional unit
      const fractionalTokens = numberTokens.slice(0, fractionalUnitIndex);
      fractionalAmount = this.parseIntegerTokens(fractionalTokens, config);
    } else {
      // Both units present
      const mainTokens = numberTokens.slice(0, mainUnitIndex);
      mainAmount = this.parseIntegerTokens(mainTokens, config);

      // Find "and" separator between main and fractional
      let fractionalStart = mainUnitIndex + 1;
      if (fractionalStart < numberTokens.length && config.texts.and.includes(numberTokens[fractionalStart])) {
        fractionalStart++;
      }

      const fractionalTokens = numberTokens.slice(fractionalStart, fractionalUnitIndex);
      fractionalAmount = this.parseIntegerTokens(fractionalTokens, config);
    }

    // Combine main and fractional amounts
    const precision = options.fractionalPrecision ?? 2;
    const divisor = Math.pow(10, precision);
    const value = mainAmount + fractionalAmount / divisor;

    return {
      value: isNegative ? -value : value,
      isCurrency: true,
      isNegative,
      currencyInfo: {
        mainAmount,
        fractionalAmount,
      },
    };
  }

  /**
   * Parse integer tokens into a number
   * Uses recursive descent for scale words
   */
  protected parseIntegerTokens(tokens: string[], config: ParserLocaleConfig): number {
    if (tokens.length === 0) {
      return 0;
    }

    // Filter out "and" words
    tokens = tokens.filter((token) => !config.texts.and.includes(token));

    if (tokens.length === 0) {
      return 0;
    }

    // Find the highest scale word
    const scaleInfo = this.findHighestScale(tokens, config);

    if (scaleInfo === null) {
      // No scale words, sum up simple numbers
      return this.sumSimpleNumbers(tokens, config);
    }

    const { index, value: scaleValue } = scaleInfo;
    const leftTokens = tokens.slice(0, index);
    const rightTokens = tokens.slice(index + 1);

    // Parse left side (multiplier for the scale)
    let leftValue = 1;
    if (leftTokens.length > 0) {
      leftValue = this.parseIntegerTokens(leftTokens, config);
      if (leftValue === 0) {
        leftValue = 1;
      }
    }

    // Parse right side (remainder after scale)
    const rightValue = rightTokens.length > 0 ? this.parseIntegerTokens(rightTokens, config) : 0;

    return leftValue * scaleValue + rightValue;
  }

  /**
   * Parse decimal tokens (digits after decimal point)
   * Returns both the numeric value and the number of decimal places
   */
  protected parseDecimalTokens(tokens: string[], config: ParserLocaleConfig): { value: number; places: number } {
    if (tokens.length === 0) {
      return { value: 0, places: 0 };
    }

    // Check if it's digit-by-digit (e.g., "zero four five")
    // This happens when the first token is zero, indicating leading zeros
    const firstDigit = config.wordToNumber.get(tokens[0]);
    const hasZeroPrefix = firstDigit === 0;

    if (hasZeroPrefix || this.isAllSingleDigits(tokens, config)) {
      // Parse digit by digit
      let decimalStr = '';
      for (const token of tokens) {
        const digit = config.wordToNumber.get(token);
        if (digit !== undefined && digit >= 0 && digit <= 9) {
          decimalStr += digit.toString();
        }
      }
      const places = decimalStr.length;
      const value = parseInt(decimalStr, 10) || 0;
      return { value, places };
    }

    // Parse as a regular number (e.g., "sixty three" => 63)
    const value = this.parseIntegerTokens(tokens, config);
    const places = value === 0 ? 0 : Math.floor(Math.log10(value)) + 1;
    return { value, places };
  }

  /**
   * Check if all tokens are single digit numbers (0-9)
   */
  protected isAllSingleDigits(tokens: string[], config: ParserLocaleConfig): boolean {
    for (const token of tokens) {
      const num = config.wordToNumber.get(token);
      if (num === undefined || num < 0 || num > 9) {
        return false;
      }
    }
    return true;
  }

  /**
   * Combine integer and decimal parts
   */
  protected combineIntegerAndDecimal(integerPart: number, decimalPart: number, decimalPlaces: number): number {
    if (decimalPart === 0 || decimalPlaces === 0) {
      return integerPart;
    }

    const divisor = Math.pow(10, decimalPlaces);
    return integerPart + decimalPart / divisor;
  }

  /**
   * Find the index of a point/decimal separator
   */
  protected findPointIndex(tokens: string[], config: ParserLocaleConfig): number {
    for (let i = 0; i < tokens.length; i++) {
      if (config.texts.point.includes(tokens[i])) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Find the index of a currency unit in tokens
   */
  protected findCurrencyUnitIndex(tokens: string[], unitWords: string[]): number {
    for (let i = 0; i < tokens.length; i++) {
      if (unitWords.includes(tokens[i])) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Find the highest scale word in tokens
   */
  protected findHighestScale(tokens: string[], config: ParserLocaleConfig): { index: number; value: number } | null {
    let highestIndex = -1;
    let highestValue = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const number = config.wordToNumber.get(token);

      if (number !== undefined && config.scaleWords.has(number)) {
        if (number > highestValue) {
          highestValue = number;
          highestIndex = i;
        }
      }
    }

    if (highestIndex === -1) {
      return null;
    }

    return { index: highestIndex, value: highestValue };
  }

  /**
   * Sum simple number words (no scale words)
   */
  protected sumSimpleNumbers(tokens: string[], config: ParserLocaleConfig): number {
    let sum = 0;

    for (const token of tokens) {
      const number = config.wordToNumber.get(token);
      if (number !== undefined) {
        sum += number;
      }
    }

    return sum;
  }

  /**
   * Check if input is valid
   */
  public isValidInput(input: string | null | undefined): boolean {
    if (input === null || input === undefined) {
      return false;
    }

    if (typeof input !== 'string') {
      return false;
    }

    const cleaned = cleanInput(input);
    return cleaned.length > 0;
  }
}
