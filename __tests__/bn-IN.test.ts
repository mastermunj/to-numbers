import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/bn-IN';

const localeCode = 'bn-IN';
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
    expect(() => toNumbersWrongLocale.convert('এক')).toThrow(/Unknown Locale/);
  });
});

// bn-IN uses Indian numbering system (Lakh, Crore)
const testIntegers: [string, number][] = [
  ['শূন্য', 0],
  ['এক', 1],
  ['দুই', 2],
  ['তিন', 3],
  ['চার', 4],
  ['পাঁচ', 5],
  ['ছয়', 6],
  ['সাত', 7],
  ['আট', 8],
  ['নয়', 9],
  ['দশ', 10],
  ['এগারো', 11],
  ['বারো', 12],
  ['তেরো', 13],
  ['চৌদ্দ', 14],
  ['পনেরো', 15],
  ['ষোলো', 16],
  ['সতেরো', 17],
  ['আঠারো', 18],
  ['ঊনিশ', 19],
  ['বিশ', 20],
  ['একুশ', 21],
  ['ত্রিশ', 30],
  ['চল্লিশ', 40],
  ['পঞ্চাশ', 50],
  ['ষাট', 60],
  ['সত্তর', 70],
  ['আশি', 80],
  ['নব্বই', 90],
  ['এক শত', 100],
  ['এক শত সাঁইত্রিশ', 137],
  ['দুই শত', 200],
  ['সাত শত', 700],
  ['এক হাজার', 1000],
  ['এক হাজার এক শত', 1100],
  ['চার হাজার ছয় শত আশি', 4680],
  ['দশ হাজার', 10000],
  ['তেষট্টি হাজার আট শত বিরানব্বই', 63892],
  ['এক লাখ', 100000],
  ['সাত লাখ বিরানব্বই হাজার পাঁচ শত একাশী', 792581],
  ['সাতাশ লাখ একচল্লিশ হাজার চৌত্রিশ', 2741034],
  ['এক কোটি', 10000000],
  ['আট কোটি চৌষট্টি লাখ ঊনত্রিশ হাজার সাত শত তিপ্পান্ন', 86429753],
  ['সাতানব্বই কোটি তিপ্পান্ন লাখ দশ হাজার আট শত চৌষট্টি', 975310864],
  ['নয় শত সাতআশি কোটি পঁয়ষট্টি লাখ তেতাল্লিশ হাজার দুই শত দশ', 9876543210],
  ['নয় হাজার আট শত ছিয়াত্তর কোটি চুয়ান্ন লাখ বত্রিশ হাজার এক শত এক', 98765432101],
  ['আটানব্বই হাজার সাত শত পঁয়ষট্টি কোটি তেতাল্লিশ লাখ একুশ হাজার বারো', 987654321012],
  ['নয় লাখ সাতআশি হাজার ছয় শত চুয়ান্ন কোটি বত্রিশ লাখ দশ হাজার এক শত তেইশ', 9876543210123],
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
    row[0] = `ঋণ ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} টাকা`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} টাকা`;
      return;
    }
    row[0] = `ঋণ ${row[0]} টাকা`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Numbers', () => {
  const additionalNumbers: [string, number][] = [
    ['বাইশ', 22],
    ['তেইশ', 23],
    ['চব্বিশ', 24],
    ['পঁচিশ', 25],
    ['ছাব্বিশ', 26],
    ['সাতাশ', 27],
    ['আঠাশ', 28],
    ['ঊনত্রিশ', 29],
    ['একত্রিশ', 31],
    ['পঁইত্রিশ', 35],
  ];

  test.concurrent.each(additionalNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
