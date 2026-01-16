import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/en-AU';

const localeCode = 'en-AU';
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
    expect(() => toNumbersWrongLocale.convert('One')).toThrow(/Unknown Locale/);
  });
});

// Test data: [words, expected number]
const testIntegers: [string, number][] = [
  ['Zero', 0],
  ['One Hundred Thirty Seven', 137],
  ['Seven Hundred', 700],
  ['One Thousand One Hundred', 1100],
  ['Four Thousand Six Hundred Eighty', 4680],
  ['Sixty Three Thousand Eight Hundred Ninety Two', 63892],
  ['Eighty Six Thousand One Hundred', 86100],
  ['Seven Hundred Ninety Two Thousand Five Hundred Eighty One', 792581],
  ['Two Million Seven Hundred Forty One Thousand Thirty Four', 2741034],
  ['Eighty Six Million Four Hundred Twenty Nine Thousand Seven Hundred Fifty Three', 86429753],
  ['Nine Hundred Seventy Five Million Three Hundred Ten Thousand Eight Hundred Sixty Four', 975310864],
  ['Nine Billion Eight Hundred Seventy Six Million Five Hundred Forty Three Thousand Two Hundred Ten', 9876543210],
  [
    'Ninety Eight Billion Seven Hundred Sixty Five Million Four Hundred Thirty Two Thousand One Hundred One',
    98765432101,
  ],
  [
    'Nine Hundred Eighty Seven Billion Six Hundred Fifty Four Million Three Hundred Twenty One Thousand Twelve',
    987654321012,
  ],
  [
    'Nine Trillion Eight Hundred Seventy Six Billion Five Hundred Forty Three Million Two Hundred Ten Thousand One Hundred Twenty Three',
    9876543210123,
  ],
  [
    'Ninety Eight Trillion Seven Hundred Sixty Five Billion Four Hundred Thirty Two Million One Hundred One Thousand Two Hundred Thirty Four',
    98765432101234,
  ],
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
    if (i === 0) {
      return;
    }
    row[0] = `Minus ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} Australian Dollars`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} Australian Dollars`;
      return;
    }
    row[0] = `Minus ${row[0]} Australian Dollars`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['Zero', 0.0],
  ['Zero Point Zero Four', 0.04],
  ['Zero Point Zero Four Six Eight', 0.0468],
  ['Zero Point Four', 0.4],
  ['Zero Point Sixty Three', 0.63],
  ['Zero Point Nine Hundred Seventy Three', 0.973],
  ['Zero Point Nine Hundred Ninety Nine', 0.999],
  ['Thirty Seven Point Zero Six', 37.06],
  ['Thirty Seven Point Zero Six Eight', 37.068],
  ['Thirty Seven Point Sixty Eight', 37.68],
  ['Thirty Seven Point Six Hundred Eighty Three', 37.683],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

const testFloatsWithCurrency: [string, number][] = [
  ['Zero Australian Dollars', 0.0],
  ['Zero Australian Dollars And Four Cents', 0.04],
  ['Zero Australian Dollars And Five Cents', 0.05],
  ['Zero Australian Dollars And Forty Cents', 0.4],
  ['Zero Australian Dollars And Sixty Three Cents', 0.63],
  ['Zero Australian Dollars And Ninety Seven Cents', 0.97],
];

describe('Test Floats with options = { currency: true }', () => {
  test.concurrent.each(testFloatsWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Simple Numbers', () => {
  const simpleNumbers: [string, number][] = [
    ['One', 1],
    ['Two', 2],
    ['Three', 3],
    ['Four', 4],
    ['Five', 5],
    ['Six', 6],
    ['Seven', 7],
    ['Eight', 8],
    ['Nine', 9],
    ['Ten', 10],
    ['Eleven', 11],
    ['Twelve', 12],
    ['Thirteen', 13],
    ['Fourteen', 14],
    ['Fifteen', 15],
    ['Sixteen', 16],
    ['Seventeen', 17],
    ['Eighteen', 18],
    ['Nineteen', 19],
    ['Twenty', 20],
    ['Twenty One', 21],
    ['Thirty', 30],
    ['Forty', 40],
    ['Fifty', 50],
    ['Sixty', 60],
    ['Seventy', 70],
    ['Eighty', 80],
    ['Ninety', 90],
    ['Ninety Nine', 99],
    ['One Hundred', 100],
  ];

  test.concurrent.each(simpleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
