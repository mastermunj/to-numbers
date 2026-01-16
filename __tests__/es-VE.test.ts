import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/es-VE';

const localeCode = 'es-VE';
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
    expect(() => toNumbersWrongLocale.convert('uno')).toThrow(/Unknown Locale/);
  });
});

const testIntegers: [string, number][] = [
  ['Cero', 0],
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
    row[0] = `${row[0]} Bolivares`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} Bolivares`;
      return;
    }
    row[0] = `Menos ${row[0]} Bolivares`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
