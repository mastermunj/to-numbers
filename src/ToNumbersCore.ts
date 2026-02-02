/**
 * ToNumbersCore - Lightweight core class without bundled locales.
 *
 * This is the base class that contains all conversion logic but does NOT import
 * any locale files. It's designed for tree-shaking when used with per-locale entry points.
 *
 * For the full package with all locales, use `ToNumbers` from the main entry point.
 * For tree-shaken single-locale imports, use `ToNumbers` from a locale entry point:
 *
 * @example
 * // Full package (all locales)
 * import { ToNumbers } from 'to-numbers';
 * const tn = new ToNumbers({ localeCode: 'en-IN' });
 *
 * // Single locale (smaller bundle) - SAME API!
 * import { ToNumbers } from 'to-numbers/en-IN';
 * const tn = new ToNumbers();
 */

import {
  ConverterOptions,
  ToNumbersOptions,
  ParseResult,
  ParserLocaleConfig,
  LocaleInterface,
  ConstructorOf,
} from './types.js';
import { tokenize, tokenizeConcatenated, cleanInput } from './tokenizer.js';
import { buildParserLocaleConfig } from './localeAdapter.js';

export const DefaultConverterOptions: ConverterOptions = {
  currency: false,
  ignoreDecimal: false,
  ignoreZeroCurrency: false,
  doNotAddOnly: false,
  fractionalPrecision: 2,
};

export const DefaultToNumbersOptions: ToNumbersOptions = {
  localeCode: 'en-IN',
  converterOptions: DefaultConverterOptions,
};

export class ToNumbersCore {
  protected options: ToNumbersOptions = {};

  protected locale: InstanceType<ConstructorOf<LocaleInterface>> | undefined = undefined;

  protected localeClass: ConstructorOf<LocaleInterface> | undefined = undefined;

  protected parserConfig: ParserLocaleConfig | undefined = undefined;

  constructor(options: ToNumbersOptions = {}) {
    this.options = Object.assign({}, DefaultToNumbersOptions, options);
  }

  /**
   * Set a locale class directly.
   * @internal Used by per-locale entry points
   */
  public setLocale(localeClass: ConstructorOf<LocaleInterface>): this {
    this.localeClass = localeClass;
    this.locale = undefined;
    this.parserConfig = undefined;
    return this;
  }

  /**
   * Get the locale class. Must be set via setLocale() or overridden in subclass.
   */
  public getLocaleClass(): ConstructorOf<LocaleInterface> {
    if (this.localeClass === undefined) {
      throw new Error('No locale set. Use setLocale() or import from a locale-specific entry point');
    }
    return this.localeClass;
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

    return this.parseNumber(words, options);
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

    const value = this.parseNumber(words, options);
    return {
      value,
      isCurrency: false,
      isNegative: value < 0,
    };
  }

  /**
   * Parse a plain number (not currency)
   */
  protected parseNumber(words: string, options: ConverterOptions = {}): number {
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

    if (pointIndex === -1 || options.ignoreDecimal) {
      // No decimal point or ignoring decimals, parse as integer
      const tokensToUse = pointIndex === -1 ? numberTokens : numberTokens.slice(0, pointIndex);
      integerPart = this.parseIntegerTokens(tokensToUse, config);
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
    if (!options.ignoreDecimal && pointIndex !== -1 && decimalPlaces > 0) {
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

    // Remove "only" suffix if present (unless doNotAddOnly is set - for backwards compat)
    if (numberTokens.length > 0 && config.texts.only.includes(numberTokens[numberTokens.length - 1])) {
      numberTokens = numberTokens.slice(0, -1);
    }

    // Use custom currency options if provided
    const currencyConfig = this.getCurrencyConfig(options);

    // Find currency unit position (now returns start and end indices for multi-word support)
    const mainUnitMatch = this.findCurrencyUnitIndex(numberTokens, currencyConfig.mainUnit);
    const fractionalUnitMatch = this.findCurrencyUnitIndex(numberTokens, currencyConfig.fractionalUnit);

    let mainAmount = 0;
    let fractionalAmount = 0;

    if (mainUnitMatch === null && fractionalUnitMatch === null) {
      // No currency units found, treat as plain number
      mainAmount = this.parseIntegerTokens(numberTokens, config);
    } else if (mainUnitMatch !== null && fractionalUnitMatch === null) {
      // Only main currency unit
      const mainTokens = numberTokens.slice(0, mainUnitMatch.startIndex);
      mainAmount = this.parseIntegerTokens(mainTokens, config);
    } else if (mainUnitMatch === null && fractionalUnitMatch !== null) {
      // Only fractional unit
      const fractionalTokens = numberTokens.slice(0, fractionalUnitMatch.startIndex);
      fractionalAmount = this.parseIntegerTokens(fractionalTokens, config);
    } else if (mainUnitMatch !== null && fractionalUnitMatch !== null) {
      // Both units present
      const mainTokens = numberTokens.slice(0, mainUnitMatch.startIndex);
      mainAmount = this.parseIntegerTokens(mainTokens, config);

      // Find "and" separator between main and fractional
      let fractionalStart = mainUnitMatch.endIndex;
      if (fractionalStart < numberTokens.length && config.texts.and.includes(numberTokens[fractionalStart])) {
        fractionalStart++;
      }

      const fractionalTokens = numberTokens.slice(fractionalStart, fractionalUnitMatch.startIndex);
      fractionalAmount = this.parseIntegerTokens(fractionalTokens, config);
    }

    // Handle ignoreZeroCurrency option
    if (options.ignoreZeroCurrency && mainAmount === 0 && fractionalAmount === 0) {
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

    // Combine main and fractional amounts
    const precision = options.fractionalPrecision ?? 2;
    const divisor = Math.pow(10, precision);
    let value = mainAmount + fractionalAmount / divisor;

    // Handle ignoreDecimal for currency
    if (options.ignoreDecimal) {
      value = mainAmount;
      fractionalAmount = 0;
    }

    return {
      value: isNegative ? -value : value,
      isCurrency: true,
      isNegative,
      currencyInfo: {
        mainAmount,
        fractionalAmount: options.ignoreDecimal ? 0 : fractionalAmount,
      },
    };
  }

  /**
   * Get currency configuration, with optional overrides
   */
  protected getCurrencyConfig(options: ConverterOptions): { mainUnit: string[]; fractionalUnit: string[] } {
    const config = this.getParserConfig();

    if (options.currencyOptions) {
      const mainUnit: string[] = [];
      const fractionalUnit: string[] = [];

      // Add custom currency names
      if (options.currencyOptions.name) {
        mainUnit.push(options.currencyOptions.name.toLowerCase());
      }
      if (options.currencyOptions.plural) {
        mainUnit.push(options.currencyOptions.plural.toLowerCase());
      }
      if (options.currencyOptions.singular) {
        mainUnit.push(options.currencyOptions.singular.toLowerCase());
      }

      // Add custom fractional unit names
      if (options.currencyOptions.fractionalUnit) {
        if (options.currencyOptions.fractionalUnit.name) {
          fractionalUnit.push(options.currencyOptions.fractionalUnit.name.toLowerCase());
        }
        if (options.currencyOptions.fractionalUnit.plural) {
          fractionalUnit.push(options.currencyOptions.fractionalUnit.plural.toLowerCase());
        }
        if (options.currencyOptions.fractionalUnit.singular) {
          fractionalUnit.push(options.currencyOptions.fractionalUnit.singular.toLowerCase());
        }
      }

      // Combine with locale defaults
      return {
        mainUnit: [...new Set([...mainUnit, ...config.currency.mainUnit])],
        fractionalUnit: [...new Set([...fractionalUnit, ...config.currency.fractionalUnit])],
      };
    }

    return config.currency;
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

    const { index, value: scaleValue, token: scaleToken } = scaleInfo;
    const leftTokens = tokens.slice(0, index);
    const rightTokens = tokens.slice(index + 1);

    // Parse left side (multiplier for the scale)
    let leftValue = 1;
    const hasExplicitLeftCoefficient = leftTokens.length > 0;
    if (hasExplicitLeftCoefficient) {
      leftValue = this.parseIntegerTokens(leftTokens, config);
      if (leftValue === 0) {
        leftValue = 1;
      }
    } else if (config.impliedDualWords.has(scaleToken)) {
      // If no left side and this is an "implied dual" word (like Italian "Milioni"),
      // the coefficient is 2 (e.g., "Milioni" alone = 2 million)
      leftValue = 2;
    }

    // Parse right side (remainder after scale)
    // Special case: In some languages like Swahili, "<scale> <one>" is a postfix
    // qualifier meaning "one of that scale" (e.g., "Mia Moja" = 100, not 101).
    // This ONLY applies when:
    // 1. The locale uses postfix one qualifiers (usesPostfixOne is true)
    // 2. There's NO explicit left coefficient (using implicit 1)
    // 3. Right side is exactly one token that's a "one" word
    // 4. There are no remaining scale words in the right tokens
    // When there IS a left coefficient (e.g., "Moja Mia Moja" = 101), the trailing
    // "one" is a remainder, not a postfix.
    let rightValue = 0;
    if (rightTokens.length > 0) {
      // Check for the "<scale> <one>" postfix pattern
      const isOneWordPostfix =
        config.usesPostfixOne &&
        !hasExplicitLeftCoefficient &&
        rightTokens.length === 1 &&
        config.oneWords.has(rightTokens[0]) &&
        this.findHighestScale(rightTokens, config) === null;

      if (!isOneWordPostfix) {
        rightValue = this.parseIntegerTokens(rightTokens, config);
      }
      // If it IS a one-word postfix, rightValue stays 0 (don't add the 1)
    }

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
   * Special handling: if point === and, we need more sophisticated detection
   * to avoid false positives where "and" is just connecting numbers
   */
  protected findPointIndex(tokens: string[], config: ParserLocaleConfig): number {
    // If point and 'and' words are the same, we can't reliably distinguish them
    // for plain number parsing - only use point in currency context
    const pointWord = config.texts.point[0];
    const andWord = config.texts.and[0];
    if (pointWord && andWord && pointWord === andWord) {
      // When point === and, don't treat it as decimal for plain numbers
      // Currency parsing has its own logic that handles this differently
      return -1;
    }

    for (let i = 0; i < tokens.length; i++) {
      if (config.texts.point.includes(tokens[i])) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Find the index of a currency unit in tokens
   * Returns the start index of the matched currency unit phrase (where to slice before)
   * and the end index (where to continue from after the unit)
   * Handles both single-word and multi-word currency names
   */
  protected findCurrencyUnitIndex(
    tokens: string[],
    unitWords: string[],
  ): { startIndex: number; endIndex: number } | null {
    for (let i = 0; i < tokens.length; i++) {
      // First check for multi-word matches starting at position i (check longer matches first)
      for (const unitWord of unitWords) {
        const unitParts = unitWord.split(' ');
        if (unitParts.length > 1) {
          // Check if consecutive tokens match the multi-word unit
          let matches = true;
          for (let j = 0; j < unitParts.length; j++) {
            if (i + j >= tokens.length || tokens[i + j] !== unitParts[j]) {
              matches = false;
              break;
            }
          }
          if (matches) {
            // Return start and end indices
            return { startIndex: i, endIndex: i + unitParts.length };
          }
        }
      }

      // Then check for single token match
      if (unitWords.includes(tokens[i])) {
        return { startIndex: i, endIndex: i + 1 };
      }
    }
    return null;
  }

  /**
   * Find the highest scale word in tokens
   */
  protected findHighestScale(
    tokens: string[],
    config: ParserLocaleConfig,
  ): { index: number; value: number; token: string } | null {
    let highestIndex = -1;
    let highestValue = 0;
    let highestToken = '';

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const number = config.wordToNumber.get(token);

      if (number !== undefined && config.scaleWords.has(number)) {
        if (number > highestValue) {
          highestValue = number;
          highestIndex = i;
          highestToken = token;
        }
      }
    }

    if (highestIndex === -1) {
      return null;
    }

    return { index: highestIndex, value: highestValue, token: highestToken };
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
