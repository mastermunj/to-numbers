import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/pt-BR';

const localeCode = 'pt-BR';
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
    expect(() => toNumbersWrongLocale.convert('Um')).toThrow(/Unknown Locale/);
  });
});

// Test data: [words, expected number]
const testIntegers: [string, number][] = [
  ['Zero', 0],
  ['Cento E Trinta E Sete', 137],
  ['Setecentos', 700],
  ['Mil Cem', 1100],
  ['Quatro Mil Seiscentos E Oitenta', 4680],
  ['Sessenta E Três Mil Oitocentos E Noventa E Dois', 63892],
  ['Oitenta E Seis Mil Cem', 86100],
  ['Setecentos E Noventa E Dois Mil Quinhentos E Oitenta E Um', 792581],
  ['Dois Milhões Setecentos E Quarenta E Um Mil Trinta E Quatro', 2741034],
  ['Oitenta E Seis Milhões Quatrocentos E Vinte E Nove Mil Setecentos E Cinquenta E Três', 86429753],
  ['Novecentos E Setenta E Cinco Milhões Trezentos E Dez Mil Oitocentos E Sessenta E Quatro', 975310864],
  ['Nove Bilhões Oitocentos E Setenta E Seis Milhões Quinhentos E Quarenta E Três Mil Duzentos E Dez', 9876543210],
  [
    'Noventa E Oito Bilhões Setecentos E Sessenta E Cinco Milhões Quatrocentos E Trinta E Dois Mil Cento E Um',
    98765432101,
  ],
  [
    'Novecentos E Oitenta E Sete Bilhões Seiscentos E Cinquenta E Quatro Milhões Trezentos E Vinte E Um Mil Doze',
    987654321012,
  ],
  [
    'Nove Trilhões Oitocentos E Setenta E Seis Bilhões Quinhentos E Quarenta E Três Milhões Duzentos E Dez Mil Cento E Vinte E Três',
    9876543210123,
  ],
  [
    'Noventa E Oito Trilhões Setecentos E Sessenta E Cinco Bilhões Quatrocentos E Trinta E Dois Milhões Cento E Um Mil Duzentos E Trinta E Quatro',
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
    row[0] = `${row[0]} Reais`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} Reais`;
      return;
    }
    row[0] = `Menos ${row[0]} Reais`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['Zero', 0.0],
  ['Zero Vírgula Zero Quatro', 0.04],
  ['Zero Vírgula Zero Quatro Seis Oito', 0.0468],
  ['Zero Vírgula Quatro', 0.4],
  ['Zero Vírgula Sessenta E Três', 0.63],
  ['Zero Vírgula Novecentos E Setenta E Três', 0.973],
  ['Zero Vírgula Novecentos E Noventa E Nove', 0.999],
  ['Trinta E Sete Vírgula Zero Seis', 37.06],
  ['Trinta E Sete Vírgula Zero Seis Oito', 37.068],
  ['Trinta E Sete Vírgula Sessenta E Oito', 37.68],
  ['Trinta E Sete Vírgula Seiscentos E Oitenta E Três', 37.683],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

const testFloatsWithCurrency: [string, number][] = [
  ['Zero Reais', 0.0],
  ['Zero Reais E Quatro Centavos', 0.04],
  ['Zero Reais E Cinco Centavos', 0.05],
  ['Zero Reais E Quarenta Centavos', 0.4],
  ['Zero Reais E Sessenta E Três Centavos', 0.63],
  ['Zero Reais E Noventa E Sete Centavos', 0.97],
  ['Trinta E Sete Reais E Seis Centavos', 37.06],
  ['Trinta E Sete Reais E Sete Centavos', 37.07],
  ['Trinta E Sete Reais E Sessenta E Oito Centavos', 37.68],
];

describe('Test Floats with options = { currency: true }', () => {
  test.concurrent.each(testFloatsWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Simple Numbers', () => {
  const simpleNumbers: [string, number][] = [
    ['Um', 1],
    ['Dois', 2],
    ['Três', 3],
    ['Quatro', 4],
    ['Cinco', 5],
    ['Seis', 6],
    ['Sete', 7],
    ['Oito', 8],
    ['Nove', 9],
    ['Dez', 10],
    ['Onze', 11],
    ['Doze', 12],
    ['Treze', 13],
    ['Quatorze', 14],
    ['Quinze', 15],
    ['Dezesseis', 16],
    ['Dezesete', 17],
    ['Dezoito', 18],
    ['Dezenove', 19],
    ['Vinte', 20],
    ['Vinte E Um', 21],
    ['Trinta', 30],
    ['Quarenta', 40],
    ['Cinquenta', 50],
    ['Sessenta', 60],
    ['Setenta', 70],
    ['Oitenta', 80],
    ['Noventa', 90],
    ['Noventa E Nove', 99],
    ['Cem', 100],
  ];

  test.concurrent.each(simpleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
