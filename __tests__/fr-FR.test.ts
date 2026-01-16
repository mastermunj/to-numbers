import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/fr-FR';

const localeCode = 'fr-FR';
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
    expect(() => toNumbersWrongLocale.convert('Un')).toThrow(/Unknown Locale/);
  });
});

// Test data: [words, expected number]
const testIntegers: [string, number][] = [
  ['Zéro', 0],
  ['Cent Trente-Sept', 137],
  ['Sept Cent', 700],
  ['Quatre Mille Six Cent Quatre-Vingt', 4680],
  ['Soixante-Trois Mille Huit Cent Quatre-Vingt-Douze', 63892],
  ['Sept Cent Quatre-Vingt-Douze Mille Cinq Cent Quatre-Vingt-Un', 792581],
  ['Un Million Trois Cent Quarante-Deux Mille Huit Cent Vingt-Trois', 1342823],
  ['Deux Millions Sept Cent Quarante Et Un Mille Trente-Quatre', 2741034],
  ['Quatre-Vingt-Six Millions Quatre Cent Vingt-Neuf Mille Sept Cent Cinquante-Trois', 86429753],
  ['Neuf Cent Soixante-Quinze Millions Trois Cent Dix Mille Huit Cent Soixante-Quatre', 975310864],
  ['Neuf Milliards Huit Cent Soixante-Seize Millions Cinq Cent Quarante-Trois Mille Deux Cent Dix', 9876543210],
  [
    'Quatre-Vingt-Dix-Huit Milliards Sept Cent Soixante-Cinq Millions Quatre Cent Trente-Deux Mille Cent Un',
    98765432101,
  ],
  [
    'Neuf Cent Quatre-Vingt-Sept Milliards Six Cent Cinquante-Quatre Millions Trois Cent Vingt Et Un Mille Douze',
    987654321012,
  ],
  [
    'Neuf Billions Huit Cent Soixante-Seize Milliards Cinq Cent Quarante-Trois Millions Deux Cent Dix Mille Cent Vingt-Trois',
    9876543210123,
  ],
  [
    'Quatre-Vingt-Dix-Huit Billions Sept Cent Soixante-Cinq Milliards Quatre Cent Trente-Deux Millions Cent Un Mille Deux Cent Trente-Quatre',
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

const testFloats: [string, number][] = [
  ['Zéro', 0.0],
  ['Zéro Virgule Zéro Quatre', 0.04],
  ['Zéro Virgule Zéro Quatre Six Huit', 0.0468],
  ['Zéro Virgule Quatre', 0.4],
  ['Zéro Virgule Soixante-Trois', 0.63],
  ['Zéro Virgule Neuf Cent Soixante-Treize', 0.973],
  ['Zéro Virgule Neuf Cent Quatre-Vingt-Dix-Neuf', 0.999],
  ['Trente-Sept Virgule Zéro Six', 37.06],
  ['Trente-Sept Virgule Zéro Six Huit', 37.068],
  ['Trente-Sept Virgule Soixante-Huit', 37.68],
  ['Trente-Sept Virgule Six Cent Quatre-Vingt-Trois', 37.683],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

const testFloatsWithCurrency: [string, number][] = [
  ['Zéro Euros', 0.0],
  ['Zéro Euros Et Quatre Centimes', 0.04],
  ['Zéro Euros Et Cinq Centimes', 0.05],
  ['Zéro Euros Et Quarante Centimes', 0.4],
  ['Zéro Euros Et Soixante-Trois Centimes', 0.63],
  ['Zéro Euros Et Quatre-Vingt-Dix-Sept Centimes', 0.97],
  ['Trente-Sept Euros Et Six Centimes', 37.06],
  ['Trente-Sept Euros Et Sept Centimes', 37.07],
  ['Trente-Sept Euros Et Soixante-Huit Centimes', 37.68],
];

describe('Test Floats with options = { currency: true }', () => {
  test.concurrent.each(testFloatsWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Simple Numbers', () => {
  const simpleNumbers: [string, number][] = [
    ['Un', 1],
    ['Deux', 2],
    ['Trois', 3],
    ['Quatre', 4],
    ['Cinq', 5],
    ['Six', 6],
    ['Sept', 7],
    ['Huit', 8],
    ['Neuf', 9],
    ['Dix', 10],
    ['Onze', 11],
    ['Douze', 12],
    ['Treize', 13],
    ['Quatorze', 14],
    ['Quinze', 15],
    ['Seize', 16],
    ['Dix-Sept', 17],
    ['Dix-Huit', 18],
    ['Dix-Neuf', 19],
    ['Vingt', 20],
    ['Vingt Et Un', 21],
    ['Trente', 30],
    ['Quarante', 40],
    ['Cinquante', 50],
    ['Soixante', 60],
    ['Soixante-Dix', 70],
    ['Quatre-Vingt', 80],
    ['Quatre-Vingt-Dix', 90],
    ['Quatre-Vingt-Dix-Neuf', 99],
    ['Cent', 100],
  ];

  test.concurrent.each(simpleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
