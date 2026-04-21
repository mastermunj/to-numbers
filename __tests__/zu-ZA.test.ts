import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import zuZa, { ToNumbers as LocaleToNumbers } from '../src/locales/zu-ZA';

const localeCode = 'zu-ZA';
const toNumbers = new ToNumbers({
  localeCode,
});

describe('Test Locale', () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toNumbers.getLocaleClass()).toBe(zuZa);
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
  const locale = new zuZa();
  const config = locale.config;

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
  ['Iqanda', 0],
  ['Ikhulu Na Amashumi Amathathu Na Isikhombisa', 137],
  ['Isikhombisa Na Ikhulu', 700],
  ['Inkulungwane Na Ikhulu', 1100],
  ['Kune Na Inkulungwane Na Isithupha Na Ikhulu Na Amashumi Ayisishiyagalombili', 4680],
  [
    'Amashumi Ayisithupha Na Kuthathu Na Inkulungwane Na Isishiyagalombili Na Ikhulu Na Amashumi Ayisishiyagalolunye Na Kubili',
    63892,
  ],
  ['Kubili Na Isigidi', 2000000],
  ['Isishiyagalolunye Na Ibhiliyoni', 9000000000],
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
  const locale = new zuZa();
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
  const locale = new zuZa();
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
  const locale = new zuZa();
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
  const locale = new zuZa();
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
  const locale = new zuZa();
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
  const locale = new zuZa();
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
  const locale = new zuZa();
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
  const locale = new zuZa();
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
  const locale = new zuZa();
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
  const locale = new zuZa();
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
