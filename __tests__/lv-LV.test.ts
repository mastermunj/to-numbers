import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/lv-LV';

const localeCode = 'lv-LV';
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
    expect(() => toNumbersWrongLocale.convert('viens')).toThrow(/Unknown Locale/);
  });
});

const testIntegers: [string, number][] = [
  ['nulle', 0],
  ['viens', 1],
  ['divi', 2],
  ['trīs', 3],
  ['četri', 4],
  ['pieci', 5],
  ['seši', 6],
  ['septiņi', 7],
  ['astoņi', 8],
  ['deviņi', 9],
  ['desmit', 10],
  ['vienpadsmit', 11],
  ['divpadsmit', 12],
  ['trīspadsmit', 13],
  ['četrdpadsmit', 14],
  ['piecpadsmit', 15],
  ['sešpadsmit', 16],
  ['septiņpadsmit', 17],
  ['astoņpadsmit', 18],
  ['deviņpadsmit', 19],
  ['divdesmit', 20],
  ['divdesmit viens', 21],
  ['trīsdesmit', 30],
  ['četrdesmit', 40],
  ['piecdesmit', 50],
  ['sešdesmit', 60],
  ['septiņdesmit', 70],
  ['astoņdesmit', 80],
  ['deviņdesmit', 90],
  ['deviņdesmit deviņi', 99],
  ['simtu', 100],
  ['simtu divdesmit trīs', 123],
  ['divi simti', 200],
  ['trīs simti', 300],
  ['četri simti', 400],
  ['pieci simti', 500],
  ['seši simti', 600],
  ['septiņi simti', 700],
  ['astoņi simti', 800],
  ['deviņi simti', 900],
  ['viens tūkstotis', 1000],
  ['viens tūkstotis simtu', 1100],
  ['divi tūkstoši trīs simti četrdesmit pieci', 2345],
  ['četri tūkstoši seši simti astoņdesmit', 4680],
  ['desmit tūkstoši', 10000],
  ['sešdesmit trīs tūkstoši astoņi simti deviņdesmit divi', 63892],
  ['simtu tūkstoši', 100000],
  ['septiņi simti deviņdesmit divi tūkstoši pieci simti astoņdesmit viens', 792581],
  ['divi miljoni septiņi simti četrdesmit viens tūkstotis trīsdesmit četri', 2741034],
  ['astoņdesmit seši miljoni četri simti divdesmit deviņi tūkstoši septiņi simti piecdesmit trīs', 86429753],
  ['deviņi simti septiņdesmit pieci miljoni trīs simti desmit tūkstoši astoņi simti sešdesmit četri', 975310864],
  [
    'deviņi miljardi astoņi simti septiņdesmit seši miljoni pieci simti četrdesmit trīs tūkstoši divi simti desmit',
    9876543210,
  ],
  [
    'deviņdesmit astoņi miljardi septiņi simti sešdesmit pieci miljoni četri simti trīsdesmit divi tūkstoši simtu viens',
    98765432101,
  ],
];

const testFloats: [string, number][] = [
  ['nulle komats viens', 0.1],
  ['nulle komats divdesmit trīs', 0.23],
  ['trīsdesmit septiņi komats seši', 37.6],
  ['simtu divdesmit trīs komats četrdesmit pieci', 123.45],
];

describe('Test Integers with options = {}', () => {
  test.concurrent.each(testIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Integers with options = {}', () => {
  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.map((row, i) => {
    if (i === 0) return;
    row[0] = `mīnus ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} eiro`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} eiro`;
      return;
    }
    row[0] = `mīnus ${row[0]} eiro`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Additional Simple Numbers', () => {
  const simpleNumbers: [string, number][] = [
    ['divdesmit divi', 22],
    ['trīsdesmit trīs', 33],
    ['četrdesmit četri', 44],
    ['piecdesmit pieci', 55],
    ['sešdesmit seši', 66],
    ['septiņdesmit septiņi', 77],
    ['astoņdesmit astoņi', 88],
  ];

  test.concurrent.each(simpleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
