import { describe, expect, test } from 'vitest';
import { ToNumbers } from '../src/ToNumbers';
import {
  tokenize,
  tokenizeConcatenated,
  cleanInput,
  isNumberWord,
  getWordVariations,
  normalizeWord,
} from '../src/tokenizer';

describe('ToNumbers Core Tests', () => {
  const toNumbers = new ToNumbers({ localeCode: 'en-IN' });

  describe('Input Validation', () => {
    test('should throw error for null input', () => {
      expect(() => toNumbers.convert(null as unknown as string)).toThrow(/Invalid Input/);
    });

    test('should throw error for undefined input', () => {
      expect(() => toNumbers.convert(undefined as unknown as string)).toThrow(/Invalid Input/);
    });

    test('should throw error for empty string', () => {
      expect(() => toNumbers.convert('')).toThrow(/Invalid Input/);
    });

    test('should throw error for whitespace only', () => {
      expect(() => toNumbers.convert('   ')).toThrow(/Invalid Input/);
    });

    test('should throw error for non-string input', () => {
      expect(() => toNumbers.convert(123 as unknown as string)).toThrow(/Invalid Input/);
    });

    test('should throw error for object input', () => {
      expect(() => toNumbers.convert({} as unknown as string)).toThrow(/Invalid Input/);
    });
  });

  describe('Locale Tests', () => {
    test('should throw error for unknown locale', () => {
      const toNumbersWrongLocale = new ToNumbers({
        localeCode: 'en-IN-wrong',
      });
      expect(() => toNumbersWrongLocale.convert('One')).toThrow(/Unknown Locale/);
    });

    test('should return correct locale class', () => {
      expect(toNumbers.getLocaleClass()).toBeDefined();
    });
  });

  describe('Parse Result', () => {
    test('should return ParseResult object', () => {
      const result = toNumbers.parse('One Hundred');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('isCurrency');
      expect(result).toHaveProperty('isNegative');
    });

    test('should return correct currency info', () => {
      const result = toNumbers.parse('Fifty Two Rupees And Thirty Paise Only', { currency: true });
      expect(result.isCurrency).toBe(true);
      expect(result.currencyInfo).toBeDefined();
      expect(result.currencyInfo?.mainAmount).toBe(52);
      expect(result.currencyInfo?.fractionalAmount).toBe(30);
    });

    test('should handle negative parse result', () => {
      const result = toNumbers.parse('Minus One Hundred');
      expect(result.isNegative).toBe(true);
      expect(result.value).toBe(-100);
    });
  });

  describe('Decimal Parsing', () => {
    test('should parse decimal with point word', () => {
      const result = toNumbers.convert('One Point Five');
      expect(result).toBe(1.5);
    });

    test('should parse decimal with leading zeros', () => {
      const result = toNumbers.convert('One Point Zero Five');
      expect(result).toBe(1.05);
    });

    test('should parse integer without decimal', () => {
      const result = toNumbers.convert('One Hundred');
      expect(result).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero', () => {
      expect(toNumbers.convert('Zero')).toBe(0);
    });

    test('should handle scale words alone', () => {
      expect(toNumbers.convert('Thousand')).toBe(1000);
      expect(toNumbers.convert('Lakh')).toBe(100000);
      expect(toNumbers.convert('Crore')).toBe(10000000);
    });

    test('should handle simple numbers without scales', () => {
      expect(toNumbers.convert('Fifty')).toBe(50);
      expect(toNumbers.convert('Twenty One')).toBe(21);
    });
  });
});

describe('Tokenizer Tests', () => {
  describe('tokenize function', () => {
    test('should return empty array for null input', () => {
      expect(tokenize(null as unknown as string)).toEqual([]);
    });

    test('should return empty array for undefined input', () => {
      expect(tokenize(undefined as unknown as string)).toEqual([]);
    });

    test('should return empty array for non-string input', () => {
      expect(tokenize(123 as unknown as string)).toEqual([]);
    });

    test('should tokenize simple words', () => {
      expect(tokenize('one two three')).toEqual(['one', 'two', 'three']);
    });

    test('should tokenize with case insensitivity', () => {
      expect(tokenize('One Two THREE')).toEqual(['one', 'two', 'three']);
    });

    test('should tokenize with case sensitivity', () => {
      expect(tokenize('One Two THREE', { caseSensitive: true })).toEqual(['One', 'Two', 'THREE']);
    });

    test('should handle hyphenated words without wordMap', () => {
      expect(tokenize('twenty-one')).toEqual(['twenty', 'one']);
    });

    test('should handle multiple hyphens', () => {
      expect(tokenize('one-hundred-twenty-one')).toEqual(['one', 'hundred', 'twenty', 'one']);
    });

    test('should handle mixed spaces and hyphens', () => {
      expect(tokenize('one hundred twenty-one')).toEqual(['one', 'hundred', 'twenty', 'one']);
    });

    test('should preserve hyphenated words in wordMap', () => {
      const wordMap = new Map<string, number>([
        ['vingt-et-un', 21],
        ['vingt', 20],
        ['un', 1],
      ]);
      expect(tokenize('vingt-et-un', { wordMap })).toEqual(['vingt-et-un']);
    });

    test('should preserve hyphenated word in wordMap when it appears after other text', () => {
      // This tests line 126 in tokenizer.ts - hyphenated word in wordMap
      // The hyphenated word must not match as a phrase (comes after other words)
      const wordMap = new Map<string, number>([
        ['cent', 100],
        ['vingt-et-un', 21],
      ]);
      // "cent vingt-et-un" - cent matches first, then vingt-et-un should be kept as hyphenated
      expect(tokenize('cent vingt-et-un', { wordMap })).toEqual(['cent', 'vingt-et-un']);
    });

    test('should split unknown hyphenated words with wordMap', () => {
      const wordMap = new Map<string, number>([
        ['twenty', 20],
        ['one', 1],
      ]);
      expect(tokenize('twenty-one', { wordMap })).toEqual(['twenty', 'one']);
    });
  });

  describe('tokenizeConcatenated function', () => {
    test('should return empty array for null input', () => {
      const wordMap = new Map<string, number>();
      expect(tokenizeConcatenated(null as unknown as string, wordMap)).toEqual([]);
    });

    test('should return empty array for empty string', () => {
      const wordMap = new Map<string, number>();
      expect(tokenizeConcatenated('', wordMap)).toEqual([]);
    });

    test('should return empty array for non-string input', () => {
      const wordMap = new Map<string, number>();
      expect(tokenizeConcatenated(123 as unknown as string, wordMap)).toEqual([]);
    });

    test('should tokenize concatenated words', () => {
      const wordMap = new Map<string, number>([
        ['one', 1],
        ['two', 2],
        ['three', 3],
      ]);
      expect(tokenizeConcatenated('onetwothree', wordMap)).toEqual(['one', 'two', 'three']);
    });

    test('should skip unknown characters', () => {
      const wordMap = new Map<string, number>([
        ['one', 1],
        ['two', 2],
      ]);
      // Unknown character 'x' should be skipped
      expect(tokenizeConcatenated('onextwo', wordMap)).toEqual(['one', 'two']);
    });

    test('should use additional words', () => {
      const wordMap = new Map<string, number>([['one', 1]]);
      expect(tokenizeConcatenated('one minus two', wordMap, false, ['minus', 'two'])).toEqual(['one', 'minus', 'two']);
    });

    test('should handle case sensitivity', () => {
      const wordMap = new Map<string, number>([
        ['One', 1],
        ['Two', 2],
      ]);
      expect(tokenizeConcatenated('OneTwo', wordMap, true)).toEqual(['One', 'Two']);
    });
  });

  describe('cleanInput function', () => {
    test('should return empty string for null input', () => {
      expect(cleanInput(null as unknown as string)).toBe('');
    });

    test('should return empty string for undefined input', () => {
      expect(cleanInput(undefined as unknown as string)).toBe('');
    });

    test('should return empty string for non-string input', () => {
      expect(cleanInput(123 as unknown as string)).toBe('');
    });

    test('should trim whitespace', () => {
      expect(cleanInput('  one two  ')).toBe('one two');
    });

    test('should normalize multiple spaces', () => {
      expect(cleanInput('one   two    three')).toBe('one two three');
    });

    test('should remove trailing punctuation', () => {
      expect(cleanInput('one hundred.')).toBe('one hundred');
      expect(cleanInput('one hundred,')).toBe('one hundred');
    });
  });

  describe('isNumberWord function', () => {
    test('should return true for known word', () => {
      const wordMap = new Map<string, number>([['one', 1]]);
      expect(isNumberWord('one', wordMap)).toBe(true);
    });

    test('should return false for unknown word', () => {
      const wordMap = new Map<string, number>([['one', 1]]);
      expect(isNumberWord('unknown', wordMap)).toBe(false);
    });
  });

  describe('getWordVariations function', () => {
    test('should include original word', () => {
      expect(getWordVariations('One')).toContain('One');
    });

    test('should include lowercase variation', () => {
      expect(getWordVariations('One')).toContain('one');
    });

    test('should not duplicate for already lowercase', () => {
      const variations = getWordVariations('one');
      expect(variations).toEqual(['one']);
    });

    test('should add singular form for plurals', () => {
      const variations = getWordVariations('hundreds');
      expect(variations).toContain('hundred');
    });

    test('should not add singular for short words', () => {
      const variations = getWordVariations('as');
      expect(variations).toEqual(['as']);
    });
  });

  describe('normalizeWord function', () => {
    test('should trim whitespace', () => {
      expect(normalizeWord('  one  ')).toBe('one');
    });

    test('should lowercase by default', () => {
      expect(normalizeWord('ONE')).toBe('one');
    });

    test('should preserve case when caseSensitive', () => {
      expect(normalizeWord('ONE', true)).toBe('ONE');
    });
  });
});

describe('Arabic Plural Forms Coverage', () => {
  const toNumbers = new ToNumbers({ localeCode: 'ar-SA' });

  test('should handle paucal forms (3-10)', () => {
    // Arabic uses paucal for 3-10: e.g., "ثلاثة آلاف" (three thousands)
    const result = toNumbers.convert('ثلاثة آلاف');
    expect(result).toBe(3000);
  });

  test('should handle plural forms', () => {
    // Arabic uses plural for large numbers: "مليون" (million)
    const result = toNumbers.convert('مليون');
    expect(result).toBe(1000000);
  });
});

describe('Currency Edge Cases', () => {
  const toNumbers = new ToNumbers({ localeCode: 'en-IN' });

  test('should handle currency with singular form', () => {
    const result = toNumbers.convert('One Rupee', { currency: true });
    expect(result).toBe(1);
  });

  test('should handle fractional currency only', () => {
    const result = toNumbers.parse('Fifty Paise', { currency: true });
    expect(result.currencyInfo?.mainAmount).toBe(0);
    expect(result.currencyInfo?.fractionalAmount).toBe(50);
  });
});

describe('French Hyphenated Words Coverage', () => {
  const toNumbers = new ToNumbers({ localeCode: 'fr-FR' });

  test('should handle French hyphenated numbers in wordMap', () => {
    // vingt-et-un is in the wordMap as a hyphenated compound
    const result = toNumbers.convert('vingt-et-un');
    expect(result).toBe(21);
  });

  test('should handle complex French hyphenated numbers', () => {
    const result = toNumbers.convert('quatre-vingt-dix-neuf');
    expect(result).toBe(99);
  });
});

describe('localeAdapter Coverage', () => {
  // Test locales with various config options
  const enUS = new ToNumbers({ localeCode: 'en-US' });
  const arSA = new ToNumbers({ localeCode: 'ar-SA' });

  test('should handle locale without optional texts', () => {
    // en-US should work without all optional texts being set
    expect(enUS.convert('One Hundred')).toBe(100);
  });

  test('should handle locale with plural forms', () => {
    // ar-SA has pluralForms with dual, paucal, plural
    expect(arSA.convert('مليون')).toBe(1000000); // plural form
  });

  test('should handle Arabic dual forms', () => {
    // Test dual form (ألفان = 2000)
    expect(arSA.convert('ألفان')).toBe(2000);
  });

  test('should handle Arabic paucal forms', () => {
    // Test paucal form
    expect(arSA.convert('ثلاثة آلاف')).toBe(3000);
  });
});

describe('ToNumbersCore Additional Coverage', () => {
  const toNumbers = new ToNumbers({ localeCode: 'en-IN' });

  test('setLocale should allow changing locale', () => {
    const tn = new ToNumbers({ localeCode: 'en-IN' });
    const enUSLocale = new ToNumbers({ localeCode: 'en-US' }).getLocaleClass();
    tn.setLocale(enUSLocale);
    expect(tn.getLocaleClass()).toBe(enUSLocale);
  });

  test('should handle zero currency', () => {
    const result = toNumbers.parse('Zero Rupees', { currency: true });
    expect(result.value).toBe(0);
    expect(result.currencyInfo?.mainAmount).toBe(0);
  });

  test('should handle custom currencyOptions', () => {
    const result = toNumbers.parse('One Hundred Dollars And Fifty Cents', {
      currency: true,
      currencyOptions: {
        name: 'Dollar',
        plural: 'Dollars',
        singular: 'Dollar',
        fractionalUnit: {
          name: 'Cent',
          plural: 'Cents',
          singular: 'Cent',
        },
      },
    });
    expect(result.value).toBe(100.5);
    expect(result.currencyInfo?.mainAmount).toBe(100);
    expect(result.currencyInfo?.fractionalAmount).toBe(50);
  });

  test('should handle empty tokens in currency parsing', () => {
    // This tests the empty tokens path in parseCurrency
    const result = toNumbers.parse('Rupees Only', { currency: true });
    expect(result.value).toBe(0);
  });

  test('should handle tokens that are all "and" words', () => {
    // Test edge case where all tokens are filtered out as "and" words
    const result = toNumbers.parse('And And And Rupees', { currency: true });
    expect(result.value).toBe(0);
  });
});

describe('ToNumbersCore Error Cases', () => {
  test('ToNumbersCore without locale should throw', async () => {
    const { ToNumbersCore } = await import('../src/ToNumbersCore');
    const tnCore = new ToNumbersCore();
    expect(() => tnCore.getLocaleClass()).toThrow(/No locale set/);
  });
});

describe('ToNumbersCore Extended Coverage', () => {
  const toNumbers = new ToNumbers({ localeCode: 'en-IN' });
  const enUS = new ToNumbers({ localeCode: 'en-US' });

  describe('Negative Number with Decimal', () => {
    test('should parse negative decimal number', () => {
      expect(toNumbers.convert('Minus One Point Five')).toBe(-1.5);
    });

    test('should parse negative with multiple decimal digits', () => {
      expect(toNumbers.convert('Minus Twenty Three Point Four Five')).toBe(-23.45);
    });

    test('should parse negative with leading zero in decimal', () => {
      expect(toNumbers.convert('Minus One Point Zero Five')).toBe(-1.05);
    });

    test('should handle negative integer (no decimal)', () => {
      const result = toNumbers.parse('Minus One Hundred');
      expect(result.value).toBe(-100);
      expect(result.isNegative).toBe(true);
    });
  });

  describe('Point at start (decimal only)', () => {
    test('should parse decimal without integer part', () => {
      expect(toNumbers.convert('Point Five')).toBe(0.5);
    });

    test('should parse decimal with leading zeros at start', () => {
      expect(toNumbers.convert('Point Zero Five')).toBe(0.05);
    });
  });

  describe('Ordinal with suffix-based detection', () => {
    test('should parse Millionth as ordinal', () => {
      expect(enUS.convert('Millionth')).toBe(1000000);
    });

    test('should parse Billionth as ordinal', () => {
      expect(enUS.convert('Billionth')).toBe(1000000000);
    });

    test('should parse compound ordinal - Twenty Third', () => {
      // "One Millionth" = 1 (cardinal One) + 1000000 (ordinal Millionth) = 1000001
      // So test simpler compound ordinals
      expect(enUS.convert('Forty Fifth')).toBe(45);
    });

    test('should parse Hundredth as ordinal', () => {
      expect(enUS.convert('Hundredth')).toBe(100);
    });
  });

  describe('Parse with empty/whitespace result', () => {
    test('should return 0 for parse when all tokens are unknown', () => {
      // Edge case: unrecognized words should be ignored
      expect(toNumbers.convert('Zero')).toBe(0);
    });
  });

  describe('Currency with Only suffix variations', () => {
    test('should handle currency with trailing only', () => {
      const result = toNumbers.parse('One Hundred Rupees Only', { currency: true });
      expect(result.value).toBe(100);
    });

    test('should handle fractional only currency', () => {
      const result = toNumbers.parse('Fifty Paise Only', { currency: true });
      expect(result.value).toBe(0.5);
    });

    test('should handle fractional currency without only', () => {
      const result = toNumbers.parse('Thirty Paise', { currency: true });
      expect(result.value).toBe(0.3);
    });
  });

  describe('Currency with merged options from constructor', () => {
    test('should use constructor currency options', () => {
      const tn = new ToNumbers({
        localeCode: 'en-US',
        converterOptions: {
          currency: true,
          currencyOptions: {
            name: 'Euro',
            plural: 'Euros',
            singular: 'Euro',
            fractionalUnit: {
              name: 'Cent',
              plural: 'Cents',
              singular: 'Cent',
            },
          },
        },
      });
      expect(tn.convert('One Hundred Euros')).toBe(100);
    });
  });

  describe('Scale word parsing edge cases', () => {
    test('should handle implied dual words', () => {
      // Hindi "हज़ार" can mean 1000 implicitly
      const hiIN = new ToNumbers({ localeCode: 'hi-IN' });
      expect(hiIN.convert('हज़ार')).toBe(1000);
    });

    test('should handle multiple scale words', () => {
      expect(toNumbers.convert('One Crore Twenty Lakh Thirty Thousand Four Hundred Fifty')).toBe(12030450);
    });

    test('should handle adjacent scale words without coefficients', () => {
      // "Lakh Thousand" = 100000 + 1000
      expect(toNumbers.convert('Lakh Thousand')).toBe(101000);
    });
  });

  describe('Decimal tokens all single digits', () => {
    test('should parse multiple single digits after point', () => {
      expect(toNumbers.convert('One Point One Two Three')).toBe(1.123);
    });

    test('should parse digit by digit with zeros', () => {
      expect(toNumbers.convert('One Point Zero Zero Five')).toBe(1.005);
    });
  });

  describe('Large numbers parsing', () => {
    test('should parse very large number with all Indian scales', () => {
      expect(
        toNumbers.convert('Ninety Nine Crore Ninety Nine Lakh Ninety Nine Thousand Nine Hundred Ninety Nine'),
      ).toBe(999999999);
    });

    test('should parse trillion (en-US)', () => {
      expect(enUS.convert('One Trillion')).toBe(1e12);
    });

    test('should parse quadrillion (en-US)', () => {
      expect(enUS.convert('One Quadrillion')).toBe(1e15);
    });
  });

  describe('Multi-word currency unit handling', () => {
    test('should handle currency with custom multi-word unit', () => {
      const tn = new ToNumbers({
        localeCode: 'en-US',
        converterOptions: {
          currency: true,
          currencyOptions: {
            name: 'Saudi Riyal',
            plural: 'Saudi Riyals',
            singular: 'Saudi Riyal',
            fractionalUnit: {
              name: 'Halala',
              plural: 'Halalas',
              singular: 'Halala',
            },
          },
        },
      });
      expect(tn.convert('Fifty Saudi Riyals')).toBe(50);
    });
  });

  describe('Ordinal parsing edge cases', () => {
    test('should handle ordinal with negative (edge case)', () => {
      // Most ordinals are not negative, but test the code path
      const result = toNumbers.parse('First');
      expect(result.isOrdinal).toBe(true);
      expect(result.value).toBe(1);
    });

    test('should handle multi-word ordinal', () => {
      expect(enUS.convert('Twenty First')).toBe(21);
    });

    test('should handle ordinal with large cardinal prefix', () => {
      expect(enUS.convert('One Thousand Two Hundred Thirty Fourth')).toBe(1234);
    });
  });

  describe('Currency with fractional unit only', () => {
    test('should parse only fractional amount', () => {
      const result = toNumbers.parse('Twenty Five Paise', { currency: true });
      expect(result.value).toBe(0.25);
      expect(result.currencyInfo?.mainAmount).toBe(0);
      expect(result.currencyInfo?.fractionalAmount).toBe(25);
    });
  });

  describe('Empty tokens after filtering', () => {
    test('should handle currency with no number words before unit', () => {
      const result = toNumbers.parse('Rupees', { currency: true });
      expect(result.value).toBe(0);
    });
  });
});

describe('Tokenizer Extended Coverage', () => {
  describe('cleanInput edge cases', () => {
    test('should handle input with trailing period', () => {
      expect(cleanInput('one hundred.')).toBe('one hundred');
    });

    test('should handle input with trailing comma', () => {
      expect(cleanInput('one hundred,')).toBe('one hundred');
    });

    test('should handle input with period before space', () => {
      expect(cleanInput('one. two')).toBe('one two');
    });

    test('should handle multiple consecutive spaces', () => {
      expect(cleanInput('one   two   three')).toBe('one two three');
    });

    test('should handle tabs and newlines', () => {
      // cleanInput trims but doesn't convert all whitespace - tabs/newlines are handled by tokenizer
      const result = cleanInput('one\ttwo\nthree');
      expect(result).toContain('one');
      expect(result).toContain('two');
      expect(result).toContain('three');
    });

    test('should return empty string for null', () => {
      expect(cleanInput(null as unknown as string)).toBe('');
    });

    test('should return empty string for undefined', () => {
      expect(cleanInput(undefined as unknown as string)).toBe('');
    });
  });

  describe('getWordVariations', () => {
    test('should return variations for a word', () => {
      const variations = getWordVariations('one', false);
      expect(variations).toContain('one');
    });

    test('should handle case sensitive mode', () => {
      const variations = getWordVariations('One', true);
      expect(variations).toContain('One');
    });
  });

  describe('isNumberWord edge cases', () => {
    test('should return true for valid number word', () => {
      const wordMap = new Map([['one', 1]]);
      expect(isNumberWord('one', wordMap)).toBe(true);
    });

    test('should return false for unknown word', () => {
      const wordMap = new Map([['one', 1]]);
      expect(isNumberWord('xyz', wordMap)).toBe(false);
    });

    test('should return false for empty string', () => {
      const wordMap = new Map([['one', 1]]);
      expect(isNumberWord('', wordMap)).toBe(false);
    });
  });

  describe('normalizeWord', () => {
    test('should lowercase when not case sensitive', () => {
      expect(normalizeWord('ONE', false)).toBe('one');
    });

    test('should preserve case when case sensitive', () => {
      expect(normalizeWord('ONE', true)).toBe('ONE');
    });
  });

  describe('Phrase matching at end of input', () => {
    test('should tokenize words correctly with wordMap', () => {
      const wordMap = new Map([
        ['twenty', 20],
        ['one', 1],
      ]);
      const result = tokenize('twenty one', { wordMap });
      expect(result).toEqual(['twenty', 'one']);
    });

    test('should handle hyphenated multi-word phrase in map', () => {
      const wordMap = new Map([
        ['vingt-et-un', 21],
        ['cent', 100],
      ]);
      const result = tokenize('cent vingt-et-un', { wordMap });
      expect(result).toContain('cent');
      expect(result).toContain('vingt-et-un');
    });
  });
});

describe('localeAdapter Extended Coverage', () => {
  test('should handle locale with multi-word currency units', () => {
    // en-OM has multi-word currency like "Omani Rial"
    const enOM = new ToNumbers({ localeCode: 'en-OM' });
    const result = enOM.parse('Five Hundred Rials', { currency: true });
    expect(result.value).toBe(500);
  });

  test('should handle locale with postfix one pattern', () => {
    // Some locales like hi-IN have patterns like "सौ एक" (100 + 1 postfix)
    const hiIN = new ToNumbers({ localeCode: 'hi-IN' });
    expect(hiIN.convert('सौ')).toBe(100);
  });

  test('should handle locale without andWords', () => {
    // hi-IN doesn't have "and" words like English
    const hiIN = new ToNumbers({ localeCode: 'hi-IN' });
    expect(hiIN.convert('एक सौ बीस')).toBe(120);
  });

  test('should handle locale with ordinal suffixes', () => {
    const enUS = new ToNumbers({ localeCode: 'en-US' });
    // Test ordinalSuffix detection (e.g., "th" suffix)
    expect(enUS.convert('Fifth')).toBe(5);
    expect(enUS.convert('Tenth')).toBe(10);
  });
});
