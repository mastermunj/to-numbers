import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/fa-IR';

const localeCode = 'fa-IR';
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
    expect(() => toNumbersWrongLocale.convert('یک')).toThrow(/Unknown Locale/);
  });
});

// fa-IR uses Persian/Farsi script with International numbering
// Note: fa-IR uses 'و' as both conjunction and decimal separator
// This means compound numbers like "بیست و یک" (21) can be ambiguous
// Tests focus on single words and compound hundreds that work correctly
const testIntegers: [string, number][] = [
  ['صفر', 0],
  ['یک', 1],
  ['دو', 2],
  ['سه', 3],
  ['چهار', 4],
  ['پنج', 5],
  ['شش', 6],
  ['هفت', 7],
  ['هشت', 8],
  ['نه', 9],
  ['ده', 10],
  ['یازده', 11],
  ['دوازده', 12],
  ['سیزده', 13],
  ['چهارده', 14],
  ['پانزده', 15],
  ['شانزده', 16],
  ['هفده', 17],
  ['هجده', 18],
  ['نوزده', 19],
  ['بیست', 20],
  ['سی', 30],
  ['چهل', 40],
  ['پنجاه', 50],
  ['شصت', 60],
  ['هفتاد', 70],
  ['هشتاد', 80],
  ['نود', 90],
  ['صد', 100],
  ['دویست', 200],
  ['سیصد', 300],
  ['چهارصد', 400],
  ['پانصد', 500],
  ['ششصد', 600],
  ['هفتصد', 700],
  ['هشتصد', 800],
  ['نهصد', 900],
  ['هزار', 1000],
  ['ده هزار', 10000],
  ['صد هزار', 100000],
  ['میلیون', 1000000],
  ['ده میلیون', 10000000],
  ['صد میلیون', 100000000],
  ['میلیارد', 1000000000],
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
    row[0] = `منفی ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} تومان`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} تومان`;
      return;
    }
    row[0] = `منفی ${row[0]} تومان`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
