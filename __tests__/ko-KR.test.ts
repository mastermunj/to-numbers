import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/ko-KR';

const localeCode = 'ko-KR';
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
    expect(() => toNumbersWrongLocale.convert('일')).toThrow(/Unknown Locale/);
  });
});

// Test data: [words, expected number] - Korean concatenates without spaces
const testIntegers: [string, number][] = [
  ['영', 0],
  ['일백삼십칠', 137],
  ['칠백', 700],
  ['일천백', 1100],
  ['사천육백팔십', 4680],
  ['육만삼천팔백구십이', 63892],
  ['팔만육천백', 86100],
  ['칠십구만이천오백팔십일', 792581],
  ['이백칠십사만일천삼십사', 2741034],
  ['팔천육백사십이만구천칠백오십삼', 86429753],
  ['구억칠천오백삼십일만팔백육십사', 975310864],
  ['구십팔억칠천육백오십사만삼천이백십', 9876543210],
  ['구백팔십칠억육천오백사십삼만이천일백일', 98765432101],
  ['구천팔백칠십육억오천사백삼십이만일천십이', 987654321012],
  ['구조팔천칠백육십오억사천삼백이십일만일백이십삼', 9876543210123],
  ['구십팔조칠천육백오십사억삼천이백십만일천이백삼십사', 98765432101234],
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
    row[0] = `마이너스${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]}원`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]}원`;
      return;
    }
    row[0] = `마이너스${row[0]}원`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['영', 0.0],
  ['영점영사', 0.04],
  ['영점영사육팔', 0.0468],
  ['영점사', 0.4],
  ['영점육십삼', 0.63],
  ['영점구백칠십삼', 0.973],
  ['영점구백구십구', 0.999],
  ['삼십칠점영육', 37.06],
  ['삼십칠점영육팔', 37.068],
  ['삼십칠점육십팔', 37.68],
  ['삼십칠점육백팔십삼', 37.683],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Additional Simple Numbers', () => {
  const simpleNumbers: [string, number][] = [
    ['일', 1],
    ['이', 2],
    ['삼', 3],
    ['사', 4],
    ['오', 5],
    ['육', 6],
    ['칠', 7],
    ['팔', 8],
    ['구', 9],
    ['십', 10],
    ['십일', 11],
    ['십이', 12],
    ['십삼', 13],
    ['십사', 14],
    ['십오', 15],
    ['십육', 16],
    ['십칠', 17],
    ['십팔', 18],
    ['십구', 19],
    ['이십', 20],
    ['이십일', 21],
    ['삼십', 30],
    ['사십', 40],
    ['오십', 50],
    ['육십', 60],
    ['칠십', 70],
    ['팔십', 80],
    ['구십', 90],
    ['구십구', 99],
    ['백', 100],
  ];

  test.concurrent.each(simpleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Korean Scale Words', () => {
  const scaleNumbers: [string, number][] = [
    ['천', 1000],
    ['일만', 10000],
    ['십만', 100000],
    ['백만', 1000000],
    ['천만', 10000000],
    ['일억', 100000000],
    ['십억', 1000000000],
    ['백억', 10000000000],
    ['천억', 100000000000],
    ['일조', 1000000000000],
  ];

  test.concurrent.each(scaleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
