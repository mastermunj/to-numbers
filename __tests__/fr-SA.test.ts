import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/fr-SA';

const localeCode = 'fr-SA';
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
    expect(() => toNumbersWrongLocale.convert('un')).toThrow(/Unknown Locale/);
  });
});

// fr-SA uses standard French numerals: Quatre-Vingt-Dix (90), Soixante-Dix (70)
const testIntegers: [string, number][] = [
  ['Zéro', 0],
  ['Un', 1],
  ['Vingt Et Un', 21],
  ['Cent', 100],
  ['Cent Trente-Sept', 137],
  ['Sept Cent', 700],
  ['Mille', 1000],
  ['Quatre Mille Six Cent Quatre-Vingt', 4680],
  ['Soixante-Trois Mille Huit Cent Quatre-Vingt-Douze', 63892],
  ['Sept Cent Quatre-Vingt-Douze Mille Cinq Cent Quatre-Vingt-Un', 792581],
  ['Un Million', 1000000],
  ['Un Million Trois Cent Quarante-Deux Mille Huit Cent Vingt-Trois', 1342823],
  ['Deux Millions Sept Cent Quarante Et Un Mille Trente-Quatre', 2741034],
  ['Quatre-Vingt-Six Millions Quatre Cent Vingt-Neuf Mille Sept Cent Cinquante-Trois', 86429753],
  ['Neuf Cent Soixante-Quinze Millions Trois Cent Dix Mille Huit Cent Soixante-Quatre', 975310864],
  ['Un Milliard', 1000000000],
  ['Neuf Milliards Huit Cent Soixante-Seize Millions Cinq Cent Quarante-Trois Mille Deux Cent Dix', 9876543210],
  [
    'Quatre-Vingt-Dix-Huit Milliards Sept Cent Soixante-Cinq Millions Quatre Cent Trente-Deux Mille Cent Un',
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
    row[0] = `Moins ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} Riyals`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} Riyals`;
      return;
    }
    row[0] = `Moins ${row[0]} Riyals`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
