import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/nl-SR';

const localeCode = 'nl-SR';
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
    expect(() => toNumbersWrongLocale.convert('een')).toThrow(/Unknown Locale/);
  });
});

const testIntegers: [string, number][] = [
  ['Nul', 0],
  ['Een Honderd Zevenendertig', 137],
  ['Zeven Honderd', 700],
  ['Een Duizend Honderd', 1100],
  ['Vier Duizend Zes Honderd Tachtig', 4680],
  ['Drieënzestig Duizend Acht Honderd Tweeënnegentig', 63892],
  ['Zesentachtig Duizend Honderd', 86100],
  ['Zeven Honderd Tweeënnegentig Duizend Vijf Honderd Eenentachtig', 792581],
  ['Twee Miljoen Zeven Honderd Eenenveertig Duizend Vierendertig', 2741034],
  ['Zesentachtig Miljoen Vier Honderd Negenentwintig Duizend Zeven Honderd Drieënvijftig', 86429753],
  ['Negen Honderd Vijfenzeventig Miljoen Drie Honderd Tien Duizend Acht Honderd Vierenzestig', 975310864],
  ['Negen Miljard Acht Honderd Zesenzeventig Miljoen Vijf Honderd Drieënveertig Duizend Twee Honderd Tien', 9876543210],
  [
    'Achtennegentig Miljard Zeven Honderd Vijfenzestig Miljoen Vier Honderd Tweeëndertig Duizend Een Honderd Een',
    98765432101,
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
    if (i === 0) return;
    row[0] = `Negatief ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} Surinaamse Dollars`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} Surinaamse Dollars`;
      return;
    }
    row[0] = `Negatief ${row[0]} Surinaamse Dollars`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
