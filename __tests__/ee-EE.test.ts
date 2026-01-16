import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/ee-EE';

const localeCode = 'ee-EE';
const toNumbers = new ToNumbers({ localeCode });

describe('Test Locale', () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toNumbers.getLocaleClass()).toBe(locale);
  });

  const wrongLocaleCode = localeCode + '-wrong';
  test(`Wrong Locale: ${wrongLocaleCode}`, () => {
    const toNumbersWrongLocale = new ToNumbers({
      localeCode: wrongLocaleCode,
    });
    expect(() => toNumbersWrongLocale.convert('üks')).toThrow(/Unknown Locale/);
  });
});

// ee-EE uses Title Case
const testIntegers: [string, number][] = [
  ['Null', 0],
  ['Ükssada', 100],
  ['Sada Kolmkümmend Seitse', 137],
  ['Seitsesada', 700],
  ['Üks Tuhat Ükssada', 1100],
  ['Neli Tuhat Kuussada Kaheksakümmend', 4680],
  ['Kuuskümmend Kolm Tuhat Kaheksasada Üheksakümmend Kaks', 63892],
  ['Seitsesada Üheksakümmend Kaks Tuhat Viissada Kaheksakümmend Üks', 792581],
  ['Kaks Miljonit Seitsesada Nelikümmend Üks Tuhat Kolmkümmend Neli', 2741034],
  ['Kaheksakümmend Kuus Miljonit Nelisada Kakskümmend Üheksa Tuhat Seitsesada Viiskümmend Kolm', 86429753],
  ['Üheksasada Seitsekümmend Viis Miljonit Kolmsada Kümme Tuhat Kaheksasada Kuuskümmend Neli', 975310864],
  ['Ükssada Miljardit', 100000000000],
  ['Üks Triljon', 1000000000000],
];

describe('Test Integers with options = {}', () => {
  test.concurrent.each(testIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Case Insensitivity', () => {
  test.concurrent.each(testIntegers)('convert lowercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toLowerCase())).toBe(expected);
  });

  test.concurrent.each(testIntegers)('convert uppercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toUpperCase())).toBe(expected);
  });
});

describe('Test Negative Integers with options = {}', () => {
  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.map((row, i) => {
    if (i === 0) return;
    row[0] = `Miinus ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} Eurot`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} Eurot`;
      return;
    }
    row[0] = `Miinus ${row[0]} Eurot`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
