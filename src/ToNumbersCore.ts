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
   * Uses pre-computed cached values for performance
   */
  protected getTokens(words: string): string[] {
    const config = this.getParserConfig();
    const cleaned = cleanInput(words);

    if (config.trim) {
      // Use pre-computed sortedConcatenatedWords for O(1) access instead of sorting on every call
      return tokenizeConcatenated(
        cleaned,
        config.wordToNumber,
        config.caseSensitive,
        config.specialWords,
        config.sortedConcatenatedWords,
      );
    }

    return tokenize(cleaned, {
      caseSensitive: config.caseSensitive,
      wordMap: config.wordToNumber,
      sortedPhrases: config.multiWordPhrases,
    });
  }

  /**
   * Convert words to a number
   * Optimized: tokenizes once and reuses tokens for ordinal check and number parsing
   */
  public convert(words: string, options: ConverterOptions = {}): number {
    // Fast path: avoid Object.assign when no options passed (common case)
    const hasCustomOptions = options.currency !== undefined || options.currencyOptions !== undefined;
    const mergedOptions = hasCustomOptions
      ? Object.assign({}, this.options.converterOptions, options)
      : this.options.converterOptions || options;

    if (!this.isValidInput(words)) {
      throw new Error(`Invalid Input "${words}"`);
    }

    if (mergedOptions.currency) {
      const result = this.parseCurrency(words, mergedOptions);
      return result.value;
    }

    // Tokenize once and reuse for both ordinal check and number parsing
    const config = this.getParserConfig();
    const tokens = this.getTokens(words);

    if (tokens.length === 0) {
      return 0;
    }

    // Try ordinal parsing first using pre-tokenized tokens
    const ordinalResult = this.parseOrdinalFromTokens(tokens, config);
    if (ordinalResult !== null) {
      return ordinalResult;
    }

    // Parse as regular number using pre-tokenized tokens
    return this.parseNumberFromTokens(tokens, config);
  }

  /**
   * Parse words and return detailed result
   * Optimized: tokenizes once and reuses tokens
   */
  public parse(words: string, options: ConverterOptions = {}): ParseResult {
    // Fast path: avoid Object.assign when no options passed (common case)
    const hasCustomOptions = options.currency !== undefined || options.currencyOptions !== undefined;
    const mergedOptions = hasCustomOptions
      ? Object.assign({}, this.options.converterOptions, options)
      : this.options.converterOptions || options;

    if (!this.isValidInput(words)) {
      throw new Error(`Invalid Input "${words}"`);
    }

    if (mergedOptions.currency) {
      return this.parseCurrency(words, mergedOptions);
    }

    // Tokenize once and reuse
    const config = this.getParserConfig();
    const tokens = this.getTokens(words);

    if (tokens.length === 0) {
      return {
        value: 0,
        isCurrency: false,
        isNegative: false,
      };
    }

    // Try ordinal parsing first using pre-tokenized tokens
    const ordinalResult = this.parseOrdinalFromTokens(tokens, config);
    if (ordinalResult !== null) {
      return {
        value: ordinalResult,
        isCurrency: false,
        isNegative: ordinalResult < 0,
        isOrdinal: true,
      };
    }

    // Parse as regular number using pre-tokenized tokens
    const value = this.parseNumberFromTokens(tokens, config);
    return {
      value,
      isCurrency: false,
      isNegative: value < 0,
    };
  }

  /**
   * Parse a plain number (not currency) - public API that tokenizes
   */
  protected parseNumber(words: string): number {
    const config = this.getParserConfig();
    const tokens = this.getTokens(words);
    return this.parseNumberFromTokens(tokens, config);
  }

  /**
   * Parse a plain number from pre-tokenized tokens
   * Optimized to avoid unnecessary array allocations
   */
  protected parseNumberFromTokens(tokens: string[], config: ParserLocaleConfig): number {
    if (tokens.length === 0) {
      return 0;
    }

    // Check for negative indicator
    let isNegative = false;
    let startIndex = 0;

    if (config.texts.minus.includes(tokens[0])) {
      isNegative = true;
      startIndex = 1;
    }

    // Fast path: no negative prefix, no decimal - most common case
    if (startIndex === 0) {
      // Check for decimal point directly in tokens
      const pointIndex = this.findPointIndexInRange(tokens, 0, tokens.length, config);

      if (pointIndex === -1) {
        // No decimal point, parse entire array as integer
        const result = this.parseIntegerTokens(tokens, config);
        return result;
      }

      // Has decimal - need to slice for decimal handling
      const integerTokens = tokens.slice(0, pointIndex);
      const decimalTokens = tokens.slice(pointIndex + 1);

      const integerPart = integerTokens.length > 0 ? this.parseIntegerTokens(integerTokens, config) : 0;
      const decimalResult = this.parseDecimalTokens(decimalTokens, config);

      if (decimalResult.places > 0) {
        return this.combineIntegerAndDecimal(integerPart, decimalResult.value, decimalResult.places);
      }
      return integerPart;
    }

    // Has negative prefix - need to slice
    const numberTokens = tokens.slice(startIndex);

    // Check for decimal point
    const pointIndex = this.findPointIndexInRange(numberTokens, 0, numberTokens.length, config);

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
   * Check if the input contains ordinal words
   * Returns the ordinal token info if found, or null if not an ordinal
   */
  protected detectOrdinal(
    tokens: string[],
    config: ParserLocaleConfig,
  ): { isOrdinal: boolean; ordinalTokenIndex: number; ordinalValue: number } | null {
    if (tokens.length === 0 || config.ordinalWordToNumber.size === 0) {
      return null;
    }

    // For short inputs (≤4 tokens), check full phrase first
    // Multi-word ordinals like "one hundredth" are typically 2-3 words max
    if (tokens.length <= 4) {
      const fullPhrase = tokens.join(' ');
      const exactMatch = config.ordinalWordToNumber.get(fullPhrase);
      if (exactMatch !== undefined) {
        return { isOrdinal: true, ordinalTokenIndex: 0, ordinalValue: exactMatch };
      }
    }

    // Check the last token for ordinal word
    const lastToken = tokens[tokens.length - 1];
    const ordinalValue = config.ordinalWordToNumber.get(lastToken);
    if (ordinalValue !== undefined) {
      return { isOrdinal: true, ordinalTokenIndex: tokens.length - 1, ordinalValue };
    }

    // Check for suffix-based ordinal (e.g., "Millionth" = "Million" + "th")
    if (config.ordinalSuffix && lastToken.endsWith(config.ordinalSuffix)) {
      const baseWord = lastToken.slice(0, -config.ordinalSuffix.length);
      const baseValue = config.wordToNumber.get(baseWord);
      if (baseValue !== undefined) {
        return { isOrdinal: true, ordinalTokenIndex: tokens.length - 1, ordinalValue: baseValue };
      }
    }

    return null;
  }

  /**
   * Parse ordinal words to a number - public API that tokenizes
   * "First" → 1, "Twenty Third" → 23, "One Hundredth" → 100
   */
  protected parseOrdinal(words: string): number | null {
    const config = this.getParserConfig();
    const tokens = this.getTokens(words);
    return this.parseOrdinalFromTokens(tokens, config);
  }

  /**
   * Parse ordinal from pre-tokenized tokens
   * Optimized to avoid double tokenization
   */
  protected parseOrdinalFromTokens(tokens: string[], config: ParserLocaleConfig): number | null {
    if (tokens.length === 0) {
      return null;
    }

    // Check for negative (ordinals are typically non-negative, but handle gracefully)
    let startIndex = 0;
    if (config.texts.minus.includes(tokens[0])) {
      startIndex = 1;
    }

    // Fast path: no negative prefix (common case)
    const numberTokens = startIndex === 0 ? tokens : tokens.slice(startIndex);
    if (numberTokens.length === 0) {
      return null;
    }

    const ordinalInfo = this.detectOrdinal(numberTokens, config);
    if (!ordinalInfo) {
      return null;
    }

    // If only ordinal token (e.g., "First", "Second")
    if (ordinalInfo.ordinalTokenIndex === 0 && numberTokens.length === 1) {
      return ordinalInfo.ordinalValue;
    }

    // Check for exact match (full phrase like "One Hundredth")
    if (ordinalInfo.ordinalTokenIndex === 0 && numberTokens.length > 1) {
      // The full phrase matched, return the value directly
      return ordinalInfo.ordinalValue;
    }

    // Composite ordinal: "Twenty Third" → "Twenty" (cardinal) + "Third" (ordinal)
    // Parse the cardinal part (all tokens before the ordinal)
    const cardinalTokens = numberTokens.slice(0, ordinalInfo.ordinalTokenIndex);
    if (cardinalTokens.length === 0) {
      return ordinalInfo.ordinalValue;
    }

    const cardinalPart = this.parseIntegerTokens(cardinalTokens, config);
    return cardinalPart + ordinalInfo.ordinalValue;
  }

  /**
   * Parse currency format
   * Optimized: uses pre-computed currency unit Sets for fast lookup
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
    let tokenStart = 0;

    if (config.texts.minus.includes(tokens[0])) {
      isNegative = true;
      tokenStart = 1;
    }

    // Check for "only" suffix
    let tokenEnd = tokens.length;
    if (tokenEnd > tokenStart && config.texts.only.includes(tokens[tokenEnd - 1])) {
      tokenEnd--;
    }

    // Fast path: use pre-computed Sets when no custom currency options
    let mainUnitMatch: { startIndex: number; endIndex: number } | null;
    let fractionalUnitMatch: { startIndex: number; endIndex: number } | null;

    if (!options.currencyOptions) {
      // Use pre-computed Sets for O(1) lookup
      mainUnitMatch = this.findCurrencyUnitInRange(
        tokens,
        tokenStart,
        tokenEnd,
        config.mainUnitSet,
        config.mainUnitMultiWord,
      );
      fractionalUnitMatch = this.findCurrencyUnitInRange(
        tokens,
        tokenStart,
        tokenEnd,
        config.fractionalUnitSet,
        config.fractionalUnitMultiWord,
      );
    } else {
      // Custom options - need to build temporary Sets
      const customConfig = this.getCurrencyConfig(options);
      mainUnitMatch = this.findCurrencyUnitInRange(
        tokens,
        tokenStart,
        tokenEnd,
        new Set(customConfig.mainUnit.filter((u) => !u.includes(' '))),
        customConfig.mainUnit.filter((u) => u.includes(' ')).map((u) => u.split(' ')),
      );
      fractionalUnitMatch = this.findCurrencyUnitInRange(
        tokens,
        tokenStart,
        tokenEnd,
        new Set(customConfig.fractionalUnit.filter((u) => !u.includes(' '))),
        customConfig.fractionalUnit.filter((u) => u.includes(' ')).map((u) => u.split(' ')),
      );
    }

    let mainAmount = 0;
    let fractionalAmount = 0;

    if (mainUnitMatch === null && fractionalUnitMatch === null) {
      // No currency units found, treat as plain number
      mainAmount = this.parseIntegerTokensInRange(tokens, tokenStart, tokenEnd, config);
    } else if (mainUnitMatch !== null && fractionalUnitMatch === null) {
      // Only main currency unit
      mainAmount = this.parseIntegerTokensInRange(tokens, tokenStart, mainUnitMatch.startIndex, config);
    } else if (mainUnitMatch === null && fractionalUnitMatch !== null) {
      // Only fractional unit
      fractionalAmount = this.parseIntegerTokensInRange(tokens, tokenStart, fractionalUnitMatch.startIndex, config);
    } else if (mainUnitMatch !== null && fractionalUnitMatch !== null) {
      // Both units present
      mainAmount = this.parseIntegerTokensInRange(tokens, tokenStart, mainUnitMatch.startIndex, config);

      // Find "and" separator between main and fractional
      let fractionalStart = mainUnitMatch.endIndex;
      if (fractionalStart < tokenEnd && config.andWordsSet.has(tokens[fractionalStart])) {
        fractionalStart++;
      }

      fractionalAmount = this.parseIntegerTokensInRange(
        tokens,
        fractionalStart,
        fractionalUnitMatch.startIndex,
        config,
      );
    }

    // Combine main and fractional amounts (always 2 decimal places for currency)
    const value = mainAmount + fractionalAmount / 100;

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
   * Find currency unit in a range of tokens using pre-computed Sets
   * Returns absolute indices (not relative to start)
   */
  protected findCurrencyUnitInRange(
    tokens: string[],
    start: number,
    end: number,
    singleWordSet: Set<string>,
    multiWordUnits: string[][],
  ): { startIndex: number; endIndex: number } | null {
    for (let i = start; i < end; i++) {
      // First check for multi-word matches starting at position i
      for (const unitParts of multiWordUnits) {
        let matches = true;
        for (let j = 0; j < unitParts.length; j++) {
          if (i + j >= end || tokens[i + j] !== unitParts[j]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          return { startIndex: i, endIndex: i + unitParts.length };
        }
      }

      // Then check for single token match using Set for O(1) lookup
      if (singleWordSet.has(tokens[i])) {
        return { startIndex: i, endIndex: i + 1 };
      }
    }
    return null;
  }

  /**
   * Parse integer tokens in a range (without creating a new array)
   */
  protected parseIntegerTokensInRange(
    tokens: string[],
    start: number,
    end: number,
    config: ParserLocaleConfig,
  ): number {
    if (start >= end) {
      return 0;
    }

    // Fast path: filter "and" words and collect scale positions in one pass
    const hasAndWords = config.andWordsSet.size > 0;
    const filteredTokens: string[] = [];
    const scalePositions: Array<{ filteredIndex: number; value: number; token: string }> = [];

    for (let i = start; i < end; i++) {
      const token = tokens[i];
      if (hasAndWords && config.andWordsSet.has(token)) {
        continue;
      }
      const num = config.wordToNumber.get(token);
      if (num !== undefined && config.scaleWords.has(num)) {
        scalePositions.push({ filteredIndex: filteredTokens.length, value: num, token });
      }
      filteredTokens.push(token);
    }

    if (filteredTokens.length === 0) {
      return 0;
    }

    // Fast path: no scale words, just sum the simple numbers
    if (scalePositions.length === 0) {
      let sum = 0;
      for (const token of filteredTokens) {
        const num = config.wordToNumber.get(token);
        if (num !== undefined) {
          sum += num;
        }
      }
      return sum;
    }

    // We have scale words - use the optimized parser with pre-computed scale positions
    return this.parseIntegerTokensWithScales(
      filteredTokens,
      0,
      filteredTokens.length,
      config,
      scalePositions,
      0,
      scalePositions.length,
    );
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
   * Optimized iterative approach: processes scale words from highest to lowest
   * to minimize array allocations and recursive calls
   */
  protected parseIntegerTokens(tokens: string[], config: ParserLocaleConfig): number {
    if (tokens.length === 0) {
      return 0;
    }

    // Fast path: if no "and" words, we can work directly with the original tokens
    const hasAndWords = config.andWordsSet.size > 0;

    if (!hasAndWords) {
      // No "and" words - work directly with original tokens (avoids allocation)
      return this.parseIntegerTokensNoAnd(tokens, config);
    }

    // Has "and" words - need to filter them out first
    // Single pass: collect scale word positions AND filter tokens simultaneously
    let highestScaleValue = 0;
    let effectiveLength = 0;

    const scalePositions: Array<{ filteredIndex: number; value: number; token: string }> = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (config.andWordsSet.has(token)) {
        continue; // Skip "and" words
      }
      const num = config.wordToNumber.get(token);
      if (num !== undefined && config.scaleWords.has(num)) {
        scalePositions.push({ filteredIndex: effectiveLength, value: num, token });
        if (num > highestScaleValue) {
          highestScaleValue = num;
        }
      }
      effectiveLength++;
    }

    if (effectiveLength === 0) {
      return 0;
    }

    // Fast path: no scale words, just sum the simple numbers
    if (scalePositions.length === 0) {
      let sum = 0;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (config.andWordsSet.has(token)) {
          continue;
        }
        const num = config.wordToNumber.get(token);
        if (num !== undefined) {
          sum += num;
        }
      }
      return sum;
    }

    // Build filtered array for locales with "and" words
    const filteredTokens: string[] = new Array(effectiveLength);
    let filteredIdx = 0;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!config.andWordsSet.has(token)) {
        filteredTokens[filteredIdx++] = token;
      }
    }

    return this.parseIntegerTokensWithScales(
      filteredTokens,
      0,
      effectiveLength,
      config,
      scalePositions,
      0,
      scalePositions.length,
    );
  }

  /**
   * Optimized path for locales without "and" words (most common case)
   * Avoids creating a filtered array by working directly with original tokens
   * Uses parallel arrays instead of object array for better cache locality
   */
  protected parseIntegerTokensNoAnd(tokens: string[], config: ParserLocaleConfig): number {
    const len = tokens.length;

    // Single pass: collect scale positions using parallel arrays (better cache locality)
    // Pre-allocate with reasonable capacity to avoid resizing
    const scaleIndices: number[] = [];
    const scaleValues: number[] = [];
    const scaleTokens: string[] = [];

    for (let i = 0; i < len; i++) {
      const token = tokens[i];
      const num = config.wordToNumber.get(token);
      if (num !== undefined && config.scaleWords.has(num)) {
        scaleIndices.push(i);
        scaleValues.push(num);
        scaleTokens.push(token);
      }
    }

    const scaleCount = scaleIndices.length;

    // Fast path: no scale words, just sum all numbers
    if (scaleCount === 0) {
      let sum = 0;
      for (let i = 0; i < len; i++) {
        const num = config.wordToNumber.get(tokens[i]);
        if (num !== undefined) {
          sum += num;
        }
      }
      return sum;
    }

    // Use parallel arrays for the recursive parser
    return this.parseWithParallelScales(tokens, 0, len, config, scaleIndices, scaleValues, scaleTokens, 0, scaleCount);
  }

  /**
   * Iterative parser using parallel arrays for scale word tracking
   * Better cache locality than object arrays
   */
  protected parseWithParallelScales(
    tokens: string[],
    start: number,
    end: number,
    config: ParserLocaleConfig,
    scaleIndices: number[],
    scaleValues: number[],
    scaleTokens: string[],
    scaleStart: number,
    scaleEnd: number,
  ): number {
    if (start >= end) {
      return 0;
    }

    // Find the highest scale word in the given scale range that's within [start, end)
    let highestIdx = -1;
    let highestValue = 0;
    let highestToken = '';
    let highestScalePos = -1;

    for (let i = scaleStart; i < scaleEnd; i++) {
      const idx = scaleIndices[i];
      if (idx >= start && idx < end) {
        const val = scaleValues[i];
        if (val > highestValue) {
          highestValue = val;
          highestIdx = idx;
          highestToken = scaleTokens[i];
          highestScalePos = i;
        }
      }
    }

    if (highestIdx === -1) {
      // No scale words in this range, sum up simple numbers
      let sum = 0;
      for (let i = start; i < end; i++) {
        const num = config.wordToNumber.get(tokens[i]);
        if (num !== undefined) {
          sum += num;
        }
      }
      return sum;
    }

    // Parse left side (multiplier for the scale)
    let leftValue = 1;
    const hasExplicitLeftCoefficient = highestIdx > start;
    if (hasExplicitLeftCoefficient) {
      leftValue = this.parseWithParallelScales(
        tokens,
        start,
        highestIdx,
        config,
        scaleIndices,
        scaleValues,
        scaleTokens,
        scaleStart,
        highestScalePos,
      );
      if (leftValue === 0) {
        leftValue = 1;
      }
    } else if (config.impliedDualWords.has(highestToken)) {
      leftValue = 2;
    }

    // Parse right side (remainder after scale)
    let rightValue = 0;
    const rightStart = highestIdx + 1;
    if (rightStart < end) {
      // Check for the "<scale> <one>" postfix pattern
      const rightLength = end - rightStart;
      if (
        config.usesPostfixOne &&
        !hasExplicitLeftCoefficient &&
        rightLength === 1 &&
        config.oneWords.has(tokens[rightStart])
      ) {
        const rightNum = config.wordToNumber.get(tokens[rightStart]);
        const isScaleWord = rightNum !== undefined && config.scaleWords.has(rightNum);
        if (!isScaleWord) {
          rightValue = 0;
        } else {
          rightValue = this.parseWithParallelScales(
            tokens,
            rightStart,
            end,
            config,
            scaleIndices,
            scaleValues,
            scaleTokens,
            highestScalePos + 1,
            scaleEnd,
          );
        }
      } else {
        rightValue = this.parseWithParallelScales(
          tokens,
          rightStart,
          end,
          config,
          scaleIndices,
          scaleValues,
          scaleTokens,
          highestScalePos + 1,
          scaleEnd,
        );
      }
    }

    return leftValue * highestValue + rightValue;
  }

  /**
   * Iterative integer parser that uses pre-computed scale positions
   * Avoids rescanning for scale words in each recursive call
   */
  protected parseIntegerTokensWithScales(
    tokens: string[],
    start: number,
    end: number,
    config: ParserLocaleConfig,
    scalePositions: Array<{ filteredIndex: number; value: number; token: string }>,
    scaleStart: number,
    scaleEnd: number,
  ): number {
    if (start >= end) {
      return 0;
    }

    // Find the highest scale word in the given scale range that's within [start, end)
    let highestIdx = -1;
    let highestValue = 0;
    let highestToken = '';
    let highestScalePos = -1;

    for (let i = scaleStart; i < scaleEnd; i++) {
      const sp = scalePositions[i];
      if (sp.filteredIndex >= start && sp.filteredIndex < end) {
        if (sp.value > highestValue) {
          highestValue = sp.value;
          highestIdx = sp.filteredIndex;
          highestToken = sp.token;
          highestScalePos = i;
        }
      }
    }

    if (highestIdx === -1) {
      // No scale words in this range, sum up simple numbers
      let sum = 0;
      for (let i = start; i < end; i++) {
        const num = config.wordToNumber.get(tokens[i]);
        if (num !== undefined) {
          sum += num;
        }
      }
      return sum;
    }

    // Parse left side (multiplier for the scale)
    let leftValue = 1;
    const hasExplicitLeftCoefficient = highestIdx > start;
    if (hasExplicitLeftCoefficient) {
      // Recursively parse left side with scale positions before the highest
      leftValue = this.parseIntegerTokensWithScales(
        tokens,
        start,
        highestIdx,
        config,
        scalePositions,
        scaleStart,
        highestScalePos,
      );
      if (leftValue === 0) {
        leftValue = 1;
      }
    } else if (config.impliedDualWords.has(highestToken)) {
      leftValue = 2;
    }

    // Parse right side (remainder after scale)
    let rightValue = 0;
    const rightStart = highestIdx + 1;
    if (rightStart < end) {
      // Check for the "<scale> <one>" postfix pattern
      const rightLength = end - rightStart;
      if (
        config.usesPostfixOne &&
        !hasExplicitLeftCoefficient &&
        rightLength === 1 &&
        config.oneWords.has(tokens[rightStart])
      ) {
        // Check if this single token is a scale word
        const rightNum = config.wordToNumber.get(tokens[rightStart]);
        const isScaleWord = rightNum !== undefined && config.scaleWords.has(rightNum);
        if (!isScaleWord) {
          // It's a postfix one, don't add it
          rightValue = 0;
        } else {
          rightValue = this.parseIntegerTokensWithScales(
            tokens,
            rightStart,
            end,
            config,
            scalePositions,
            highestScalePos + 1,
            scaleEnd,
          );
        }
      } else {
        rightValue = this.parseIntegerTokensWithScales(
          tokens,
          rightStart,
          end,
          config,
          scalePositions,
          highestScalePos + 1,
          scaleEnd,
        );
      }
    }

    return leftValue * highestValue + rightValue;
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
   * Find the index of a point/decimal separator within a range
   * Optimized version that works on a range without creating new arrays
   */
  protected findPointIndexInRange(tokens: string[], start: number, end: number, config: ParserLocaleConfig): number {
    // If point and 'and' words are the same, we can't reliably distinguish them
    const pointWord = config.texts.point[0];
    const andWord = config.texts.and[0];
    if (pointWord && andWord && pointWord === andWord) {
      return -1;
    }

    for (let i = start; i < end; i++) {
      if (config.texts.point.includes(tokens[i])) {
        return i - start; // Return relative index
      }
    }
    return -1;
  }

  /**
   * Check if input is valid
   * Optimized to avoid calling cleanInput for performance
   */
  public isValidInput(input: string | null | undefined): boolean {
    if (input === null || input === undefined) {
      return false;
    }

    if (typeof input !== 'string') {
      return false;
    }

    // Fast path: just check if there's any non-whitespace content
    // Avoid calling cleanInput which does regex operations
    for (let i = 0; i < input.length; i++) {
      const c = input.charCodeAt(i);
      // Check for non-whitespace (space, tab, newline, carriage return)
      if (c !== 32 && c !== 9 && c !== 10 && c !== 13) {
        return true;
      }
    }
    return false;
  }
}
