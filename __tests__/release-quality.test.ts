import { afterEach, describe, expect, test, vi } from 'vitest';
import { runCli } from '../src/cli';
import { ToNumbers } from '../src/ToNumbers';
import { ToNumbersCore } from '../src/ToNumbersCore';
import {
  buildCurrencyWords,
  buildFractionDenominatorMap,
  buildFormalWordToNumberMap,
  buildOrdinalWordToNumberMap,
  buildParserLocaleConfig,
  buildWordToNumberMap,
  detectUsesPostfixOne,
  extractImpliedDualWords,
} from '../src/localeAdapter';
import { cleanInput, tokenize } from '../src/tokenizer';
import type { ConverterOptions, OriginalLocaleConfig, ParserLocaleConfig } from '../src/types';
import EnUsLocale from '../src/locales/en-US';

type LocaleModule = {
  default: new () => { config: OriginalLocaleConfig };
  ToNumbers: new () => { convert(words: string, options?: ConverterOptions): number };
  toNumbers: (words: string, options?: ConverterOptions) => number;
};

const EN_US_CONFIG = new ToNumbers({ localeCode: 'en-US' }).getParserConfig();
const IG_NG_CONFIG = new ToNumbers({ localeCode: 'ig-NG' }).getParserConfig();

function cloneParserConfig(base: ParserLocaleConfig): ParserLocaleConfig {
  return {
    ...base,
    wordToNumber: new Map(base.wordToNumber),
    scaleWords: new Set(base.scaleWords),
    impliedDualWords: new Set(base.impliedDualWords),
    oneWords: new Set(base.oneWords),
    texts: {
      and: [...base.texts.and],
      minus: [...base.texts.minus],
      point: [...base.texts.point],
      only: [...base.texts.only],
    },
    currency: {
      mainUnit: [...base.currency.mainUnit],
      fractionalUnit: [...base.currency.fractionalUnit],
    },
    ordinalWordToNumber: new Map(base.ordinalWordToNumber),
    formalWordToNumber: base.formalWordToNumber ? new Map(base.formalWordToNumber) : undefined,
    fractionDenominatorMap: base.fractionDenominatorMap
      ? new Map([...base.fractionDenominatorMap.entries()].map(([key, value]) => [key, { ...value }]))
      : undefined,
    sortedPhrases: [...base.sortedPhrases],
    multiWordPhrases: [...base.multiWordPhrases],
    specialWords: [...base.specialWords],
    sortedConcatenatedWords: [...base.sortedConcatenatedWords],
    andWordsSet: new Set(base.andWordsSet),
    mainUnitSet: new Set(base.mainUnitSet),
    fractionalUnitSet: new Set(base.fractionalUnitSet),
    mainUnitMultiWord: base.mainUnitMultiWord.map((parts) => [...parts]),
    fractionalUnitMultiWord: base.fractionalUnitMultiWord.map((parts) => [...parts]),
  };
}

function pickSampleWord(value: string | [string, string]): string {
  return Array.isArray(value) ? value[0] : value;
}

function pickLocaleSample(config: OriginalLocaleConfig): { input: string; expected: number } {
  const exactCandidate = config.exactWordsMapping?.find(
    (mapping) => typeof mapping.number === 'number' && Number.isSafeInteger(mapping.number),
  );
  if (exactCandidate) {
    return {
      input: pickSampleWord(exactCandidate.value),
      expected: exactCandidate.number,
    };
  }

  const numberCandidate = [...config.numberWordsMapping]
    .reverse()
    .find((mapping) => typeof mapping.number === 'number' && Number.isSafeInteger(mapping.number));

  if (!numberCandidate) {
    throw new Error('No numeric sample found for locale');
  }

  return {
    input: pickSampleWord(numberCandidate.value),
    expected: numberCandidate.number,
  };
}

function findTokenByValue(config: ParserLocaleConfig, value: number): string {
  const token = [...config.wordToNumber.entries()].find(([, entryValue]) => entryValue === value)?.[0];
  if (!token) {
    throw new Error(`Missing token for value ${value}`);
  }
  return token;
}

class Harness extends ToNumbersCore {
  constructor(config: ParserLocaleConfig) {
    super();
    this.parserConfig = config;
  }

  public exposeParseNumber(words: string): number {
    return this.parseNumber(words);
  }

  public exposeParseNumberFromTokens(tokens: string[], config: ParserLocaleConfig): number {
    return this.parseNumberFromTokens(tokens, config);
  }

  public exposeParseIntegerScaleFirst(tokens: string[], config: ParserLocaleConfig): number {
    return this.parseIntegerScaleFirst(tokens, config);
  }

  public exposeFindNextScaleFirstValueIndex(tokens: string[], start: number, config: ParserLocaleConfig): number {
    return this.findNextScaleFirstValueIndex(tokens, start, config);
  }

  public exposeFindScaleFirstCoefficientRange(
    tokens: string[],
    start: number,
    config: ParserLocaleConfig,
  ): { end: number } {
    return this.findScaleFirstCoefficientRange(tokens, start, config);
  }

  public exposeFindScaleFirstAdditiveRange(
    tokens: string[],
    start: number,
    config: ParserLocaleConfig,
  ): { end: number } {
    return this.findScaleFirstAdditiveRange(tokens, start, config);
  }

  public exposeParseNumberFromFormalTokens(formalTokens: string[], config: ParserLocaleConfig): number {
    return this.parseNumberFromFormalTokens(formalTokens, config);
  }

  public exposeDetectOrdinal(tokens: string[], config: ParserLocaleConfig) {
    return this.detectOrdinal(tokens, config);
  }

  public exposeParseOrdinal(words: string): number | null {
    return this.parseOrdinal(words);
  }

  public exposeParseOrdinalFromTokens(tokens: string[], config: ParserLocaleConfig): number | null {
    return this.parseOrdinalFromTokens(tokens, config);
  }

  public exposeParseCurrency(words: string, options: ConverterOptions) {
    return this.parseCurrency(words, options);
  }

  public exposeGetCurrencyConfig(options: ConverterOptions) {
    return this.getCurrencyConfig(options);
  }

  public exposeParseIntegerTokens(tokens: string[], config: ParserLocaleConfig): number {
    return this.parseIntegerTokens(tokens, config);
  }

  public exposeParseIntegerTokensNoAnd(tokens: string[], config: ParserLocaleConfig): number {
    return this.parseIntegerTokensNoAnd(tokens, config);
  }

  public exposeParseWithParallelScales(
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
    return this.parseWithParallelScales(
      tokens,
      start,
      end,
      config,
      scaleIndices,
      scaleValues,
      scaleTokens,
      scaleStart,
      scaleEnd,
    );
  }

  public exposeParseIntegerTokensWithScales(
    tokens: string[],
    start: number,
    end: number,
    config: ParserLocaleConfig,
    scalePositions: Array<{ filteredIndex: number; value: number; token: string }>,
    scaleStart: number,
    scaleEnd: number,
  ): number {
    return this.parseIntegerTokensWithScales(tokens, start, end, config, scalePositions, scaleStart, scaleEnd);
  }

  public exposeParseDecimalTokens(tokens: string[], config: ParserLocaleConfig): { value: number; places: number } {
    return this.parseDecimalTokens(tokens, config);
  }

  public exposeParseScaleFirstAdditiveGroup(
    tokens: string[],
    start: number,
    end: number,
    config: ParserLocaleConfig,
  ): number {
    return this.parseScaleFirstAdditiveGroup(tokens, start, end, config);
  }

  public exposeTryParseFractionDecimal(
    tokens: string[],
    config: ParserLocaleConfig,
    allowAmbiguousScaleDenominator: boolean,
  ): { value: number; places: number } | null {
    return this.tryParseFractionDecimal(tokens, config, allowAmbiguousScaleDenominator);
  }

  public exposeCombineIntegerAndDecimal(integerPart: number, decimalPart: number, decimalPlaces: number): number {
    return this.combineIntegerAndDecimal(integerPart, decimalPart, decimalPlaces);
  }

  public exposeFindPointIndexInRange(tokens: string[], start: number, end: number, config: ParserLocaleConfig): number {
    return this.findPointIndexInRange(tokens, start, end, config);
  }
}

class FormalFallbackHarness extends Harness {
  constructor(
    config: ParserLocaleConfig,
    private readonly rawTokens: string[],
    private readonly forcedFormalTokens: string[] | null,
  ) {
    super(config);
  }

  protected getTokens(): string[] {
    return [...this.rawTokens];
  }

  protected getFormalTokens(): string[] | null {
    return this.forcedFormalTokens ? [...this.forcedFormalTokens] : null;
  }
}

describe('Release Coverage - Locale Helpers', () => {
  const localeEntries = Object.entries(import.meta.glob('../src/locales/*.ts', { eager: true })) as Array<
    [string, LocaleModule]
  >;

  test.each(localeEntries.filter(([filePath]) => !filePath.endsWith('/index.ts')))(
    '%s helper exports parse a sample',
    (_, entry) => {
      const sample = pickLocaleSample(new entry.default().config);
      const localeInstance = new entry.ToNumbers();

      expect(entry.toNumbers(sample.input)).toBe(sample.expected);
      expect(localeInstance.convert(sample.input)).toBe(sample.expected);
    },
  );
});

describe('Release Coverage - CLI', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('runCli returns 1 when --words is missing a value', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(runCli(['--words', '--locale', 'en-US'])).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith('Error: --words requires text to parse.');
  });

  test('runCli returns 1 when no input words are provided', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(runCli(['--currency'])).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith('Error: No words provided to parse.');
  });

  test('cli module does not auto-run when there is no executable path', async () => {
    const originalArgv = [...process.argv];
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    try {
      process.argv = [originalArgv[0]];
      vi.resetModules();
      await import('../src/cli');
      expect(exitSpy).not.toHaveBeenCalled();
    } finally {
      process.argv = originalArgv;
    }
  });

  test('cli module auto-runs when imported as the executable entry point', async () => {
    const originalArgv = [...process.argv];
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`exit:${code ?? 0}`);
    }) as never);

    try {
      process.argv = [originalArgv[0], 'cli.ts', '--help'];
      vi.resetModules();
      await expect(import('../src/cli')).rejects.toThrow('exit:0');
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Usage: to-numbers'));
      expect(exitSpy).toHaveBeenCalledWith(0);
    } finally {
      process.argv = originalArgv;
    }
  });
});

describe('Release Coverage - Tokenizer', () => {
  test('tokenize handles phrase matching with internal whitespace gaps', () => {
    const wordMap = new Map<string, number>([
      ['one hundred', 100],
      ['two', 2],
    ]);

    expect(tokenize('one hundred   two', { wordMap, sortedPhrases: ['one hundred'] })).toEqual(['one hundred', 'two']);
  });

  test('tokenize splits unknown hyphenated words with a word map', () => {
    const wordMap = new Map<string, number>([['known', 1]]);

    expect(tokenize('twenty-one', { wordMap })).toEqual(['twenty', 'one']);
  });

  test('tokenize keeps unmatched single words when no mapping exists', () => {
    const wordMap = new Map<string, number>([['one', 1]]);

    expect(tokenize('mystery token', { wordMap })).toEqual(['mystery', 'token']);
  });

  test('cleanInput removes punctuation before a following space', () => {
    expect(cleanInput('one, two')).toBe('one two');
  });
});

describe('Release Coverage - Locale Adapter', () => {
  const baseConfig = new EnUsLocale().config;

  test('detectUsesPostfixOne ignores exact words that are not two-part expressions', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      exactWordsMapping: [{ number: 100, value: 'one hundred one' }],
    };

    expect(detectUsesPostfixOne(config, new Set([100]), new Set(['one']))).toBe(false);
  });

  test('detectUsesPostfixOne recognizes scale plus one expressions', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      exactWordsMapping: [{ number: 100, value: 'hundred one' }],
    };

    expect(detectUsesPostfixOne(config, new Set([100]), new Set(['one']))).toBe(true);
  });

  test('buildWordToNumberMap includes paucal and plural variants from pluralForms', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      pluralForms: {
        1000: {
          paucal: 'ThousandsFew',
          plural: 'ThousandsMany',
        },
      },
    };

    const wordMap = buildWordToNumberMap(config);

    expect(wordMap.get('thousandsfew')).toBe(1000);
    expect(wordMap.get('thousandsmany')).toBe(1000);
  });

  test('extractImpliedDualWords keeps dual words shared with plural variants', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      pluralForms: {
        1000000: {
          dual: 'Milioni',
          plural: 'Milioni',
        },
      },
    };

    expect(extractImpliedDualWords(config)).toEqual(new Set(['milioni']));
  });

  test('buildCurrencyWords normalizes configured currency labels', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      currency: {
        name: 'Dollar',
        plural: 'Dollars',
        singular: 'Dollar',
        symbol: '$',
        fractionalUnit: {
          name: 'Cent',
          plural: 'Cents',
          singular: 'Cent',
          symbol: '¢',
        },
      },
    };

    expect(buildCurrencyWords(config)).toEqual({
      mainUnit: ['dollar', 'dollars', 'dollar'],
      fractionalUnit: ['cent', 'cents', 'cent'],
    });
  });

  test('buildOrdinalWordToNumberMap includes feminine and masculine ordinal variants', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      ordinalWordsMapping: [
        {
          number: 1,
          value: 'First',
          feminineValue: 'Prima',
          masculineValue: 'Primo',
        },
      ],
    };

    const ordinalMap = buildOrdinalWordToNumberMap(config);

    expect(ordinalMap.get('prima')).toBe(1);
    expect(ordinalMap.get('primo')).toBe(1);
  });

  test('buildFormalWordToNumberMap includes singular forms and ignores multi-word exact entries', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      formalConfig: {
        numberWordsMapping: [{ number: 2, value: 'Two', singularValue: 'TwoSolo' }],
        exactWordsMapping: [
          { number: 3, value: 'Three' },
          { number: 100, value: 'One Hundred' },
        ],
      },
    };

    const formalMap = buildFormalWordToNumberMap(config);

    expect(formalMap?.get('twosolo')).toBe(2);
    expect(formalMap?.get('three')).toBe(3);
    expect(formalMap?.has('one hundred')).toBe(false);
  });

  test('buildFormalWordToNumberMap returns undefined for empty formal mappings', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      formalConfig: {},
    };

    expect(buildFormalWordToNumberMap(config)).toBeUndefined();
  });

  test('buildFractionDenominatorMap stores singular, plural, and hyphen-split variants', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      fractionDenominatorMapping: {
        2: {
          singular: 'Hundred-Thousandth',
          plural: 'Hundred-Thousandths',
        },
      },
    };

    const denominatorMap = buildFractionDenominatorMap(config);

    expect(denominatorMap?.get('hundred-thousandth')).toEqual({ places: 2, isSingular: true });
    expect(denominatorMap?.get('hundred thousandth')).toEqual({ places: 2, isSingular: true });
    expect(denominatorMap?.get('hundred-thousandths')).toEqual({ places: 2, isSingular: false });
    expect(denominatorMap?.get('hundred thousandths')).toEqual({ places: 2, isSingular: false });
  });

  test('buildFractionDenominatorMap returns undefined when no denominators are configured', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      fractionDenominatorMapping: {},
    };

    expect(buildFractionDenominatorMap(config)).toBeUndefined();
  });

  test('buildParserLocaleConfig splits multi-word fractional currency units', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      currency: {
        name: 'Dollar',
        plural: 'Dollars',
        singular: 'Dollar',
        symbol: '$',
        fractionalUnit: {
          name: 'Saudi Halala',
          plural: 'Saudi Halalas',
          singular: 'Saudi Halala',
          symbol: 'h',
        },
      },
    };

    const parserConfig = buildParserLocaleConfig(config);

    expect(parserConfig.fractionalUnitMultiWord).toContainEqual(['saudi', 'halala']);
  });

  test('buildParserLocaleConfig handles empty minus and point markers', () => {
    const config: OriginalLocaleConfig = {
      ...baseConfig,
      texts: {
        and: 'And',
        minus: '',
        only: '',
        point: '',
      },
    };

    const parserConfig = buildParserLocaleConfig(config);

    expect(parserConfig.texts.minus).toEqual([]);
    expect(parserConfig.texts.point).toEqual([]);
  });
});

describe('Release Coverage - ToNumbersCore', () => {
  test('getLocale caches the locale instance', () => {
    const toNumbers = new ToNumbers({ localeCode: 'en-US' });
    const first = toNumbers.getLocale();

    expect(toNumbers.getLocale()).toBe(first);
  });

  test('parse validates input and returns zero for punctuation-only content', () => {
    const toNumbers = new ToNumbers({ localeCode: 'en-US' });

    expect(() => toNumbers.parse(null as unknown as string)).toThrow(/Invalid Input/);
    expect(toNumbers.parse('.')).toEqual({
      value: 0,
      isCurrency: false,
      isNegative: false,
    });
  });

  test('parse handles ordinal and formal fallback paths', () => {
    const enUs = new ToNumbers({ localeCode: 'en-US' });
    const zhCn = new ToNumbers({ localeCode: 'zh-CN' });

    expect(enUs.parse('First')).toEqual({
      value: 1,
      isCurrency: false,
      isNegative: false,
      isOrdinal: true,
    });
    expect(zhCn.parse('玖拾')).toEqual({
      value: 90,
      isCurrency: false,
      isNegative: false,
    });
  });

  test('custom formal fallbacks work in both convert and parse when normal parsing returns zero', () => {
    const config = cloneParserConfig(EN_US_CONFIG);
    const harness = new Harness(config);

    config.formalWordToNumber = new Map([['formalseven', 7]]);

    expect(harness.convert('formalseven')).toBe(7);
    expect(harness.parse('formalseven')).toEqual({
      value: 7,
      isCurrency: false,
      isNegative: false,
    });
  });

  test('formal fallback is used when regular tokens are present but do not resolve to a value', () => {
    const config = cloneParserConfig(EN_US_CONFIG);

    config.formalWordToNumber = new Map([['formal-one', 1]]);

    const harness = new FormalFallbackHarness(config, ['mystery'], ['formal-one']);

    expect(harness.convert('ignored')).toBe(1);
    expect(harness.parse('ignored')).toEqual({
      value: 1,
      isCurrency: false,
      isNegative: false,
    });
  });

  test('formal fallback skips empty formal token results after a zero-value parse', () => {
    const config = cloneParserConfig(EN_US_CONFIG);

    config.formalWordToNumber = new Map([['formal-one', 1]]);

    const harness = new FormalFallbackHarness(config, ['mystery'], []);

    expect(harness.convert('ignored')).toBe(0);
    expect(harness.parse('ignored')).toEqual({
      value: 0,
      isCurrency: false,
      isNegative: false,
    });
  });

  test('parseNumber wrapper and empty token handling delegate correctly', () => {
    const config = cloneParserConfig(EN_US_CONFIG);
    const harness = new Harness(config);

    expect(harness.exposeParseNumber('One Hundred')).toBe(100);
    expect(harness.exposeParseNumberFromTokens(['minus', 'point', 'five'], config)).toBe(-0.5);
    expect(harness.exposeParseNumberFromTokens([], config)).toBe(0);
  });

  test('scale-first helpers cover empty, connector, and unknown-token branches', () => {
    const config = cloneParserConfig(IG_NG_CONFIG);
    const harness = new Harness(config);
    const andToken = config.texts.and[0];
    const twoToken = findTokenByValue(config, 2);
    const thousandToken = findTokenByValue(config, 1000);

    expect(harness.exposeParseIntegerScaleFirst([], config)).toBe(0);
    expect(harness.exposeParseIntegerScaleFirst([andToken, thousandToken], config)).toBe(1000);
    expect(harness.exposeFindNextScaleFirstValueIndex([andToken, andToken, twoToken], 0, config)).toBe(2);
    expect(harness.exposeFindScaleFirstCoefficientRange(['unknown', twoToken, thousandToken], 0, config)).toEqual({
      end: 2,
    });
    expect(harness.exposeFindScaleFirstAdditiveRange(['unknown', twoToken, thousandToken], 0, config)).toEqual({
      end: 2,
    });
  });

  test('formal token parser returns zero without formal tokens or mappings', () => {
    const harness = new Harness(cloneParserConfig(EN_US_CONFIG));
    const noFormalConfig = cloneParserConfig(EN_US_CONFIG);
    noFormalConfig.formalWordToNumber = undefined;

    expect(harness.exposeParseNumberFromFormalTokens([], harness.getParserConfig())).toBe(0);
    expect(harness.exposeParseNumberFromFormalTokens(['壹'], noFormalConfig)).toBe(0);
  });

  test('ordinal helpers cover wrapper, prefix, suffix, and empty-token branches', () => {
    const enUsConfig = cloneParserConfig(EN_US_CONFIG);
    const enUsHarness = new Harness(enUsConfig);
    const prefixConfig = cloneParserConfig(EN_US_CONFIG);
    const prefixHarness = new Harness(prefixConfig);

    enUsConfig.ordinalSuffix = 'th';
    enUsConfig.ordinalWordToNumber.delete('millionth');
    prefixConfig.ordinalPrefix = 'prefix';

    expect(enUsHarness.exposeParseOrdinal('First')).toBe(1);
    expect(enUsHarness.exposeParseOrdinalFromTokens([], enUsConfig)).toBeNull();
    expect(enUsHarness.exposeParseOrdinalFromTokens(['minus'], enUsConfig)).toBeNull();
    expect(enUsHarness.exposeDetectOrdinal(['millionth'], enUsConfig)).toEqual({
      isOrdinal: true,
      ordinalTokenIndex: 0,
      ordinalValue: 1000000,
    });
    expect(prefixHarness.exposeDetectOrdinal(['prefix'], prefixConfig)).toBeNull();
    expect(prefixHarness.exposeParseOrdinalFromTokens(['prefix'], prefixConfig)).toBeNull();
    expect(prefixHarness.exposeParseOrdinalFromTokens(['prefix', 'three'], prefixConfig)).toBe(3);
  });

  test('currency helpers cover empty-token parsing and default currency config fallback', () => {
    const harness = new Harness(cloneParserConfig(EN_US_CONFIG));

    expect(harness.exposeParseCurrency('   ', { currency: true })).toMatchObject({
      value: 0,
      isCurrency: true,
      isNegative: false,
      currencyInfo: {
        mainAmount: 0,
        fractionalAmount: 0,
      },
    });
    expect(harness.exposeGetCurrencyConfig({})).toEqual(harness.getParserConfig().currency);
    expect(harness.exposeGetCurrencyConfig({ currencyOptions: {} })).toEqual({
      mainUnit: ['dollar', 'dollars'],
      fractionalUnit: ['cent', 'cents'],
    });
    expect(
      harness.exposeGetCurrencyConfig({
        currencyOptions: {
          fractionalUnit: {
            name: 'Centavo',
          },
        },
      }),
    ).toEqual({
      mainUnit: ['dollar', 'dollars'],
      fractionalUnit: ['centavo', 'cent', 'cents'],
    });
  });

  test('currency parsing supports custom multi-word fractional units', () => {
    const toNumbers = new ToNumbers({ localeCode: 'en-US' });

    expect(
      toNumbers.parse('One Dollar And Twenty Five Saudi Halalas', {
        currency: true,
        currencyOptions: {
          name: 'Dollar',
          plural: 'Dollars',
          singular: 'Dollar',
          fractionalUnit: {
            name: 'Saudi Halala',
            plural: 'Saudi Halalas',
            singular: 'Saudi Halala',
          },
        },
      }),
    ).toMatchObject({
      value: 1.25,
      currencyInfo: {
        mainAmount: 1,
        fractionalAmount: 25,
      },
    });
  });

  test('currency parsing covers both-units path without an and separator and sparse overrides', () => {
    const toNumbers = new ToNumbers({ localeCode: 'en-US' });

    expect(toNumbers.parse('One Dollar', { currency: true }).value).toBe(1);
    expect(toNumbers.parse('One Dollar Twenty Five Cents', { currency: true }).value).toBe(1.25);
    expect(toNumbers.parse('Twenty Five Cents', { currency: true }).value).toBe(0.25);
    expect(
      toNumbers.parse('One Dollar And Twenty Five Cents', {
        currency: true,
        currencyOptions: {
          singular: 'Dollar',
          fractionalUnit: {
            singular: 'Cent',
          },
        },
      }).value,
    ).toBe(1.25);
  });

  test('integer parsers cover empty, connector-only, and zero-left-side recursion', () => {
    const config = cloneParserConfig(EN_US_CONFIG);
    const harness = new Harness(config);

    expect(harness.exposeParseIntegerTokens([], config)).toBe(0);
    expect(harness.exposeParseIntegerTokens(['and', 'and'], config)).toBe(0);
    expect(harness.exposeParseIntegerTokensNoAnd(['unknown', 'hundred'], config)).toBe(100);
    expect(harness.exposeParseWithParallelScales([], 0, 0, config, [], [], [], 0, 0)).toBe(0);
    expect(harness.exposeParseIntegerTokensWithScales([], 0, 0, config, [], 0, 0)).toBe(0);
    expect(
      harness.exposeParseWithParallelScales(
        ['one', 'hundred', 'thousand'],
        1,
        3,
        config,
        [0, 2],
        [1, 1000],
        ['one', 'thousand'],
        0,
        2,
      ),
    ).toBe(100000);
    expect(
      harness.exposeParseIntegerTokensWithScales(
        ['one', 'hundred', 'thousand'],
        1,
        3,
        config,
        [
          { filteredIndex: 0, value: 1, token: 'one' },
          { filteredIndex: 2, value: 1000, token: 'thousand' },
        ],
        0,
        2,
      ),
    ).toBe(100000);
  });

  test('integer parsers cover implied dual and postfix-one scale recursion', () => {
    const config = cloneParserConfig(EN_US_CONFIG);
    const harness = new Harness(config);
    const postfixOneConfig = cloneParserConfig(EN_US_CONFIG);
    const postfixOneHarness = new Harness(postfixOneConfig);

    config.andWordsSet = new Set();
    config.texts.and = [];
    config.wordToNumber.set('dual-hundred', 100);
    config.wordToNumber.set('thousand', 1000);
    config.wordToNumber.set('hundred', 100);
    config.scaleWords = new Set([100, 1000]);
    config.impliedDualWords = new Set(['dual-hundred']);
    config.oneWords = new Set(['hundred']);
    config.usesPostfixOne = true;

    postfixOneConfig.andWordsSet = new Set();
    postfixOneConfig.texts.and = [];
    postfixOneConfig.wordToNumber.set('thousand', 1000);
    postfixOneConfig.wordToNumber.set('one', 1);
    postfixOneConfig.scaleWords = new Set([1000]);
    postfixOneConfig.oneWords = new Set(['one']);
    postfixOneConfig.usesPostfixOne = true;

    expect(harness.exposeParseIntegerTokensNoAnd(['dual-hundred'], config)).toBe(200);
    expect(
      harness.exposeParseWithParallelScales(
        ['thousand', 'hundred'],
        0,
        2,
        config,
        [0, 1],
        [1000, 100],
        ['thousand', 'hundred'],
        0,
        2,
      ),
    ).toBe(1100);
    expect(
      postfixOneHarness.exposeParseWithParallelScales(
        ['thousand', 'one'],
        0,
        2,
        postfixOneConfig,
        [0],
        [1000],
        ['thousand'],
        0,
        1,
      ),
    ).toBe(1000);
    expect(
      harness.exposeParseIntegerTokensWithScales(
        ['thousand', 'hundred'],
        0,
        2,
        config,
        [
          { filteredIndex: 0, value: 1000, token: 'thousand' },
          { filteredIndex: 1, value: 100, token: 'hundred' },
        ],
        0,
        2,
      ),
    ).toBe(1100);
    expect(
      postfixOneHarness.exposeParseIntegerTokensWithScales(
        ['thousand', 'one'],
        0,
        2,
        postfixOneConfig,
        [{ filteredIndex: 0, value: 1000, token: 'thousand' }],
        0,
        1,
      ),
    ).toBe(1000);
  });

  test('decimal helpers cover empty tokens, leading connectors, and zero decimal combinations', () => {
    const config = cloneParserConfig(EN_US_CONFIG);
    const harness = new Harness(config);

    config.andWordsSet = new Set(['and']);
    config.wordToNumber.set('five', 5);
    config.fractionDenominatorMap = new Map([['hundredths', { places: 2, isSingular: false }]]);

    expect(harness.exposeParseDecimalTokens([], config)).toEqual({ value: 0, places: 0 });
    expect(harness.exposeTryParseFractionDecimal(['and', 'five', 'hundredths'], config, true)).toEqual({
      value: 5,
      places: 2,
    });
    expect(harness.exposeParseDecimalTokens(['zero', 'mystery'], config)).toEqual({ value: 0, places: 1 });
    expect(harness.exposeTryParseFractionDecimal(['hundredths'], config, true)).toEqual({ value: 0, places: 2 });
    expect(harness.exposeParseNumberFromTokens(['one', 'point', 'mystery'], config)).toBe(1);
    expect(harness.exposeParseNumberFromTokens(['minus', 'five', 'hundredths'], config)).toBe(-0.05);
    expect(harness.exposeCombineIntegerAndDecimal(12, 0, 2)).toBe(12);
    expect(harness.exposeCombineIntegerAndDecimal(12, 34, 0)).toBe(12);
  });

  test('remaining helper branches cover scale-first additive filtering and point-less ordinal checks', () => {
    const scaleFirstHarness = new Harness(cloneParserConfig(IG_NG_CONFIG));
    const noPointConfig = cloneParserConfig(EN_US_CONFIG);
    const suffixConfig = cloneParserConfig(EN_US_CONFIG);
    const noPointHarness = new Harness(noPointConfig);
    const suffixHarness = new Harness(suffixConfig);
    const thousandToken = findTokenByValue(IG_NG_CONFIG, 1000);
    const millionToken = findTokenByValue(IG_NG_CONFIG, 1000000);
    const twoToken = findTokenByValue(IG_NG_CONFIG, 2);

    noPointConfig.texts.point = [];
    suffixConfig.ordinalSuffix = 'th';
    suffixConfig.wordToNumber.set('million', 1000000);

    expect(
      scaleFirstHarness.exposeParseScaleFirstAdditiveGroup(['mystery', thousandToken, twoToken], 0, 3, IG_NG_CONFIG),
    ).toBe(2);
    expect(scaleFirstHarness.exposeParseIntegerScaleFirst([thousandToken, millionToken], IG_NG_CONFIG)).toBe(1001000);
    expect(noPointHarness.exposeDetectOrdinal(['first'], noPointConfig)).toEqual({
      isOrdinal: true,
      ordinalTokenIndex: 0,
      ordinalValue: 1,
    });
    expect(suffixHarness.exposeDetectOrdinal(['millionth'], suffixConfig)).toEqual({
      isOrdinal: true,
      ordinalTokenIndex: 0,
      ordinalValue: 1000000,
    });
    expect(suffixHarness.exposeDetectOrdinal(['mysteryth'], suffixConfig)).toBeNull();
  });

  test('locales that omit the leading zero in decimals still parse correctly', () => {
    const tr = new ToNumbers({ localeCode: 'tr-TR' });
    const fa = new ToNumbers({ localeCode: 'fa-IR' });

    expect(tr.convert('virgül beş')).toBe(0.5);
    expect(fa.convert('و پنج')).toBe(0.5);
  });

  test('findPointIndexInRange handles both ignore-zero and fraction-denominator ambiguity cases', () => {
    const ignoreZeroConfig = cloneParserConfig(EN_US_CONFIG);
    const fractionConfig = cloneParserConfig(EN_US_CONFIG);
    const harness = new Harness(ignoreZeroConfig);

    ignoreZeroConfig.texts.and = ['point'];
    ignoreZeroConfig.texts.point = ['point'];
    ignoreZeroConfig.ignoreZeroInDecimals = true;

    fractionConfig.texts.and = ['and'];
    fractionConfig.texts.point = ['and'];
    fractionConfig.fractionDenominatorMap = new Map([['hundredths', { places: 2, isSingular: false }]]);

    expect(harness.exposeFindPointIndexInRange(['point', 'five'], 0, 2, ignoreZeroConfig)).toBe(0);
    expect(harness.exposeFindPointIndexInRange(['and', 'five', 'hundredths'], 0, 3, fractionConfig)).toBe(0);
    expect(harness.exposeFindPointIndexInRange(['and'], 0, 1, fractionConfig)).toBe(-1);
  });
});
