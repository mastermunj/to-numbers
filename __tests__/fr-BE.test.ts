import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/fr-BE';

const localeCode = 'fr-BE';
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

// fr-BE uses Belgian numerals: Septante (70), Nonante (90), Quatre-Vingt (80)
const testIntegers: [string, number][] = [
  ['Zéro', 0],
  ['Cent Trente-Sept', 137],
  ['Sept Cent', 700],
  ['Quatre Mille Six Cent Quatre-Vingt', 4680],
  ['Soixante-Trois Mille Huit Cent Nonante-Deux', 63892],
  ['Sept Cent Nonante-Deux Mille Cinq Cent Quatre-Vingt-Un', 792581],
  ['Un Million Trois Cent Quarante-Deux Mille Huit Cent Vingt-Trois', 1342823],
  ['Deux Millions Sept Cent Quarante-Et-Un Mille Trente-Quatre', 2741034],
  ['Quatre-Vingt-Six Millions Quatre Cent Vingt-Neuf Mille Sept Cent Cinquante-Trois', 86429753],
  ['Neuf Cent Septante-Cinq Millions Trois Cent Dix Mille Huit Cent Soixante-Quatre', 975310864],
  ['Neuf Milliards Huit Cent Septante-Six Millions Cinq Cent Quarante-Trois Mille Deux Cent Dix', 9876543210],
  ['Nonante-Huit Milliards Sept Cent Soixante-Cinq Millions Quatre Cent Trente-Deux Mille Cent Un', 98765432101],
  [
    'Neuf Cent Quatre-Vingt-Sept Milliards Six Cent Cinquante-Quatre Millions Trois Cent Vingt-Et-Un Mille Douze',
    987654321012,
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
    row[0] = `${row[0]} Euros`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} Euros`;
      return;
    }
    row[0] = `Moins ${row[0]} Euros`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
