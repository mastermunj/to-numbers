import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/tr-TR';

const localeCode = 'tr-TR';
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
    expect(() => toNumbersWrongLocale.convert('sıfır')).toThrow(/Unknown Locale/);
  });
});

// Test data: [words, expected number] - using lowercase to avoid Turkish İ/ı case sensitivity issues
const testIntegers: [string, number][] = [
  ['sıfır', 0],
  ['yüz otuz yedi', 137],
  ['yedi yüz', 700],
  ['bin yüz', 1100],
  ['dört bin altı yüz seksen', 4680],
  ['altmış üç bin sekiz yüz doksan iki', 63892],
  ['seksen altı bin yüz', 86100],
  ['yedi yüz doksan iki bin beş yüz seksen bir', 792581],
  ['iki milyon yedi yüz kırk bir bin otuz dört', 2741034],
  ['seksen altı milyon dört yüz yirmi dokuz bin yedi yüz elli üç', 86429753],
  ['dokuz yüz yetmiş beş milyon üç yüz on bin sekiz yüz altmış dört', 975310864],
  ['dokuz milyar sekiz yüz yetmiş altı milyon beş yüz kırk üç bin iki yüz on', 9876543210],
  ['doksan sekiz milyar yedi yüz altmış beş milyon dört yüz otuz iki bin yüz bir', 98765432101],
];

describe('Test Integers with options = {}', () => {
  test.concurrent.each(testIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Integers with options = {}', () => {
  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.map((row, i) => {
    if (i === 0) {
      return;
    }
    row[0] = `eksi ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} lira`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} lira`;
      return;
    }
    row[0] = `eksi ${row[0]} lira`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['sıfır', 0.0],
  ['sıfır virgül sıfır dört', 0.04],
  ['sıfır virgül dört', 0.4],
  ['sıfır virgül altmış üç', 0.63],
  ['otuz yedi virgül sıfır altı', 37.06],
  ['otuz yedi virgül altmış sekiz', 37.68],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Additional Simple Numbers', () => {
  const simpleNumbers: [string, number][] = [
    ['bir', 1],
    ['iki', 2],
    ['üç', 3],
    ['dört', 4],
    ['beş', 5],
    ['altı', 6],
    ['yedi', 7],
    ['sekiz', 8],
    ['dokuz', 9],
    ['on', 10],
    ['on bir', 11],
    ['on iki', 12],
    ['on üç', 13],
    ['on dört', 14],
    ['on beş', 15],
    ['on altı', 16],
    ['on yedi', 17],
    ['on sekiz', 18],
    ['on dokuz', 19],
    ['yirmi', 20],
    ['yirmi bir', 21],
    ['otuz', 30],
    ['kırk', 40],
    ['elli', 50],
    ['altmış', 60],
    ['yetmiş', 70],
    ['seksen', 80],
    ['doksan', 90],
    ['doksan dokuz', 99],
    ['yüz', 100],
  ];

  test.concurrent.each(simpleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
