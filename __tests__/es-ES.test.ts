import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/es-ES';

const localeCode = 'es-ES';
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
    expect(() => toNumbersWrongLocale.convert('Uno')).toThrow(/Unknown Locale/);
  });
});

// Test data: [words, expected number]
const testIntegers: [string, number][] = [
  ['Cero', 0],
  ['Uno', 1],
  ['Ciento Treinta Y Siete', 137],
  ['Setecientos', 700],
  ['Mil Cien', 1100],
  ['Cuatro Mil Seiscientos Ochenta', 4680],
  ['Sesenta Y Tres Mil Ochocientos Noventa Y Dos', 63892],
  ['Ochenta Y Seis Mil Cien', 86100],
  ['Setecientos Noventa Y Dos Mil Quinientos Ochenta Y Uno', 792581],
  ['Dos Millones Setecientos Cuarenta Y Un Mil Treinta Y Cuatro', 2741034],
  ['Ochenta Y Seis Millones Cuatrocientos Veintinueve Mil Setecientos Cincuenta Y Tres', 86429753],
  ['Novecientos Setenta Y Cinco Millones Trescientos Diez Mil Ochocientos Sesenta Y Cuatro', 975310864],
  ['Nueve Mil Ochocientos Setenta Y Seis Millones Quinientos Cuarenta Y Tres Mil Doscientos Diez', 9876543210],
  ['Noventa Y Ocho Mil Setecientos Sesenta Y Cinco Millones Cuatrocientos Treinta Y Dos Mil Ciento Uno', 98765432101],
  [
    'Novecientos Ochenta Y Siete Mil Seiscientos Cincuenta Y Cuatro Millones Trescientos Veintiuno Mil Doce',
    987654321012,
  ],
  [
    'Nueve Billones Ochocientos Setenta Y Seis Mil Quinientos Cuarenta Y Tres Millones Doscientos Diez Mil Ciento Veintitrés',
    9876543210123,
  ],
  [
    'Noventa Y Ocho Billones Setecientos Sesenta Y Cinco Mil Cuatrocientos Treinta Y Dos Millones Ciento Un Mil Doscientos Treinta Y Cuatro',
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
    row[0] = `Menos ${row[0]}`;
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
    row[0] = `Menos ${row[0]} Euros`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['Cero', 0.0],
  ['Cero Punto Cero Cuatro', 0.04],
  ['Cero Punto Cero Cuatro Seis Ocho', 0.0468],
  ['Cero Punto Cuatro', 0.4],
  ['Cero Punto Sesenta Y Tres', 0.63],
  ['Cero Punto Novecientos Setenta Y Tres', 0.973],
  ['Cero Punto Novecientos Noventa Y Nueve', 0.999],
  ['Treinta Y Siete Punto Cero Seis', 37.06],
  ['Treinta Y Siete Punto Cero Seis Ocho', 37.068],
  ['Treinta Y Siete Punto Sesenta Y Ocho', 37.68],
  ['Treinta Y Siete Punto Seiscientos Ochenta Y Tres', 37.683],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

const testFloatsWithCurrency: [string, number][] = [
  ['Cero Euros', 0.0],
  ['Cero Euros Y Cuatro Centimos', 0.04],
  ['Cero Euros Y Cinco Centimos', 0.05],
  ['Cero Euros Y Cuarenta Centimos', 0.4],
  ['Cero Euros Y Sesenta Y Tres Centimos', 0.63],
  ['Cero Euros Y Noventa Y Siete Centimos', 0.97],
  ['Treinta Y Siete Euros Y Seis Centimos', 37.06],
  ['Treinta Y Siete Euros Y Siete Centimos', 37.07],
  ['Treinta Y Siete Euros Y Sesenta Y Ocho Centimos', 37.68],
];

describe('Test Floats with options = { currency: true }', () => {
  test.concurrent.each(testFloatsWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Simple Numbers', () => {
  const simpleNumbers: [string, number][] = [
    ['Uno', 1],
    ['Dos', 2],
    ['Tres', 3],
    ['Cuatro', 4],
    ['Cinco', 5],
    ['Seis', 6],
    ['Siete', 7],
    ['Ocho', 8],
    ['Nueve', 9],
    ['Diez', 10],
    ['Once', 11],
    ['Doce', 12],
    ['Trece', 13],
    ['Catorce', 14],
    ['Quince', 15],
    ['Dieciseis', 16],
    ['Dieciciete', 17],
    ['Dieciocho', 18],
    ['Diecinueve', 19],
    ['Veinte', 20],
    ['Veintiuno', 21],
    ['Treinta', 30],
    ['Cuarenta', 40],
    ['Cincuenta', 50],
    ['Sesenta', 60],
    ['Setenta', 70],
    ['Ochenta', 80],
    ['Noventa', 90],
    ['Noventa Y Nueve', 99],
    ['Cien', 100],
  ];

  test.concurrent.each(simpleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
