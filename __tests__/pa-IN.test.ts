import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import paIn, { ToNumbers as LocaleToNumbers } from '../src/locales/pa-IN';

const localeCode = 'pa-IN';
const toNumbers = new ToNumbers({
  localeCode,
});

describe('Test Locale', () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toNumbers.getLocaleClass()).toBe(paIn);
  });

  test(`Per-locale ToNumbers class: ${localeCode}`, () => {
    const localeTn = new LocaleToNumbers();
    expect(localeTn.convert('0')).toBeDefined();
  });

  const wrongLocaleCode = localeCode + '-wrong';
  test(`Wrong Locale: ${wrongLocaleCode}`, () => {
    const toNumbersWrongLocale = new ToNumbers({
      localeCode: wrongLocaleCode,
    });
    expect(() => toNumbersWrongLocale.convert('One')).toThrow(/Unknown Locale/);
  });
});

// Test basic numbers from locale config (0-99, 100, 1000, etc.)
describe('Test Basic Numbers from Locale Config', () => {
  const locale = new paIn();
  const config = locale.config;

  // Get all mappable entries from numberWordsMapping (exclude bigint values)
  // When there are duplicate words, keep the LAST occurrence (lower number)
  // because the tokenizer matches smaller numbers first when words are the same
  const wordToEntry = new Map<string, { number: number; value: string }>();
  config.numberWordsMapping
    .filter((entry) => entry && entry.value && typeof entry.number === 'number' && entry.number <= 1e15)
    .forEach((entry) => {
      const lowerValue = entry.value.toLowerCase();
      wordToEntry.set(lowerValue, entry);
    });

  const basicTests: [string, number][] = Array.from(wordToEntry.values()).map(
    (entry) => [entry.value, entry.number] as [string, number],
  );

  test.concurrent.each(basicTests)('basic: "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

// Test data: [words, expected number]
const testIntegers: [string, number][] = [
  ['ਸਿਫ਼ਰ', 0],
  ['ਇੱਕ ਸੌ ਸੰਤੀ', 137],
  ['ਸੱਤ ਸੌ', 700],
  ['ਚਾਰ ਹਜ਼ਾਰ ਛੇ ਸੌ ਅੱਸੀ', 4680],
  ['ਤਰੇਹਠ ਹਜ਼ਾਰ ਅੱਠ ਸੌ ਬਾਣਵੇਂ', 63892],
  ['ਸੱਤ ਲੱਖ ਬਾਣਵੇਂ ਹਜ਼ਾਰ ਪੰਜ ਸੌ ਇਕਾਸੀ', 792581],
  ['ਸਤਾਈ ਲੱਖ ਇਕਤਾਲੀ ਹਜ਼ਾਰ ਚੌਂਤੀ', 2741034],
  ['ਅੱਠ ਕਰੋੜ ਚੌਂਹਠ ਲੱਖ ਉਣੱਤੀ ਹਜ਼ਾਰ ਸੱਤ ਸੌ ਤਿਰਵੰਜਾ', 86429753],
  ['ਸਤਾਣਵੇਂ ਕਰੋੜ ਤਿਰਵੰਜਾ ਲੱਖ ਦਸ ਹਜ਼ਾਰ ਅੱਠ ਸੌ ਚੌਂਹਠ', 975310864],
  ['ਨੌਂ ਅਰਬ ਸਤਾਸੀ ਕਰੋੜ ਪੈਂਹਠ ਲੱਖ ਤਰਤਾਲੀ ਹਜ਼ਾਰ ਦੋ ਸੌ ਦਸ', 9876543210],
  ['ਅਠਾਣਵੇਂ ਅਰਬ ਛਿਹੱਤਰ ਕਰੋੜ ਚੁਰੰਜਾ ਲੱਖ ਬੱਤੀ ਹਜ਼ਾਰ ਇੱਕ ਸੌ ਇੱਕ', 98765432101],
  ['ਨੌਂ ਖਰਬ ਸਤਾਸੀ ਅਰਬ ਪੈਂਹਠ ਕਰੋੜ ਤਰਤਾਲੀ ਲੱਖ ਇੱਕੀ ਹਜ਼ਾਰ ਬਾਰਾਂ', 987654321012],
  ['ਅਠਾਣਵੇਂ ਖਰਬ ਛਿਹੱਤਰ ਅਰਬ ਚੁਰੰਜਾ ਕਰੋੜ ਬੱਤੀ ਲੱਖ ਦਸ ਹਜ਼ਾਰ ਇੱਕ ਸੌ ਤੇਈ', 9876543210123],
  ['ਨੌਂ ਨੀਲ ਸਤਾਸੀ ਖਰਬ ਪੈਂਹਠ ਅਰਬ ਤਰਤਾਲੀ ਕਰੋੜ ਇੱਕੀ ਲੱਖ ਇੱਕ ਹਜ਼ਾਰ ਦੋ ਸੌ ਚੌਂਤੀ', 98765432101234],
];

describe('Test Integers with options = {}', () => {
  test.concurrent.each(testIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Case Insensitivity - Lowercase', () => {
  test.concurrent.each(testIntegers)('convert lowercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toLowerCase())).toBe(expected);
  });
});

describe('Test Case Insensitivity - Uppercase', () => {
  test.concurrent.each(testIntegers)('convert uppercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toUpperCase())).toBe(expected);
  });
});

describe('Test Negative Integers with options = {}', () => {
  const locale = new paIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.forEach((row, i) => {
    if (i === 0 || row[1] === 0) {
      return;
    }
    row[0] = `${minusWord} ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Integers - Lowercase', () => {
  const locale = new paIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.forEach((row, i) => {
    if (i === 0 || row[1] === 0) {
      return;
    }
    row[0] = `${minusWord} ${row[0]}`.toLowerCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Integers - Uppercase', () => {
  const locale = new paIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.forEach((row, i) => {
    if (i === 0 || row[1] === 0) {
      return;
    }
    row[0] = `${minusWord} ${row[0]}`.toUpperCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const locale = new paIn();
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    row[0] = `${row[0]}${suffix}`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true, doNotAddOnly: true }', () => {
  const locale = new paIn();
  const currency = locale.config.currency;

  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    row[0] = `${row[0]} ${currUnit}`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const locale = new paIn();
  const minusWord = locale.config.texts.minus;
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.forEach((row, i) => {
    const currUnit = row[1] === 1 || row[1] === -1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    if (i === 0 || row[1] === 0) {
      row[0] = `${row[0]}${suffix}`;
      return;
    }
    row[0] = `${minusWord} ${row[0]}${suffix}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true, doNotAddOnly: true }', () => {
  const locale = new paIn();
  const minusWord = locale.config.texts.minus;
  const currency = locale.config.currency;

  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.forEach((row, i) => {
    const currUnit = row[1] === 1 || row[1] === -1 ? currency.singular : currency.plural;
    if (i === 0 || row[1] === 0) {
      row[0] = `${row[0]} ${currUnit}`;
      return;
    }
    row[0] = `${minusWord} ${row[0]} ${currUnit}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Currency - Lowercase', () => {
  const locale = new paIn();
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    row[0] = `${row[0]}${suffix}`.toLowerCase();
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Currency - Uppercase', () => {
  const locale = new paIn();
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    row[0] = `${row[0]}${suffix}`.toUpperCase();
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Currency - Lowercase', () => {
  const locale = new paIn();
  const minusWord = locale.config.texts.minus;
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.forEach((row, i) => {
    const currUnit = row[1] === 1 || row[1] === -1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    if (i === 0 || row[1] === 0) {
      row[0] = `${row[0]}${suffix}`.toLowerCase();
      return;
    }
    row[0] = `${minusWord} ${row[0]}${suffix}`.toLowerCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['ਸਿਫ਼ਰ', 0],
  ['ਸਿਫ਼ਰ ਦਸ਼ਮਲਵ ਸਿਫ਼ਰ ਚਾਰ', 0.04],
  ['ਸਿਫ਼ਰ ਦਸ਼ਮਲਵ ਸਿਫ਼ਰ ਚਾਰ ਛੇ ਅੱਠ', 0.0468],
  ['ਸਿਫ਼ਰ ਦਸ਼ਮਲਵ ਚਾਰ', 0.4],
  ['ਸਿਫ਼ਰ ਦਸ਼ਮਲਵ ਤਰੇਹਠ', 0.63],
  ['ਸਿਫ਼ਰ ਦਸ਼ਮਲਵ ਨੌਂ ਸੌ ਤਿਹੱਤਰ', 0.973],
  ['ਸਿਫ਼ਰ ਦਸ਼ਮਲਵ ਨੌਂ ਸੌ ਨਿੰਨਾਣਵੇਂ', 0.999],
  ['ਸੰਤੀ ਦਸ਼ਮਲਵ ਸਿਫ਼ਰ ਛੇ', 37.06],
  ['ਸੰਤੀ ਦਸ਼ਮਲਵ ਸਿਫ਼ਰ ਛੇ ਅੱਠ', 37.068],
  ['ਸੰਤੀ ਦਸ਼ਮਲਵ ਅਠਾਹਟ', 37.68],
  ['ਸੰਤੀ ਦਸ਼ਮਲਵ ਛੇ ਸੌ ਤਿਰਾਸੀ', 37.683],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Floats - Lowercase', () => {
  test.concurrent.each(testFloats)('convert lowercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toLowerCase())).toBe(expected);
  });
});

describe('Test Floats - Uppercase', () => {
  test.concurrent.each(testFloats)('convert uppercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toUpperCase())).toBe(expected);
  });
});

describe('Test Negative Floats', () => {
  const locale = new paIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeFloats: [string, number][] = cloneDeep(testFloats);
  testNegativeFloats.forEach((row, i) => {
    if (i === 0 || row[1] === 0) return;
    row[0] = `${minusWord} ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeFloats.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Floats - Lowercase', () => {
  const locale = new paIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeFloats: [string, number][] = cloneDeep(testFloats);
  testNegativeFloats.forEach((row, i) => {
    if (i === 0 || row[1] === 0) return;
    row[0] = `${minusWord} ${row[0]}`.toLowerCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeFloats.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

// Ordinal number tests
const testOrdinals: [string, number][] = [
  ['ਪਹਿਲਾ', 1],
  ['ਦੂਜਾ', 2],
  ['ਤੀਜਾ', 3],
  ['ਚੌਥਾ', 4],
  ['ਪੰਜਵਾਂ', 5],
  ['ਛੇਵਾਂ', 6],
  ['ਸੱਤਵਾਂ', 7],
  ['ਅੱਠਵਾਂ', 8],
  ['ਨੌਂਵਾਂ', 9],
  ['ਦਸਵਾਂ', 10],
];

describe('Test Ordinal Numbers', () => {
  test.concurrent.each(testOrdinals)('convert ordinal "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Ordinal Parse Result', () => {
  test('parse returns isOrdinal true for ordinal input', () => {
    const result = toNumbers.parse('ਪਹਿਲਾ');
    expect(result.value).toBe(1);
    expect(result.isOrdinal).toBe(true);
    expect(result.isCurrency).toBe(false);
  });

  test('parse returns isOrdinal undefined for cardinal input', () => {
    const result = toNumbers.parse('ਇੱਕ');
    expect(result.value).toBe(1);
    expect(result.isOrdinal).toBeUndefined();
  });
});
