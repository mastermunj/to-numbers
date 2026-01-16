import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/ar-AE';

const localeCode = 'ar-AE';
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
    expect(() => toNumbersWrongLocale.convert('واحد')).toThrow(/Unknown Locale/);
  });
});

// ar-AE uses International numbering system
const testIntegers: [string, number][] = [
  ['صفر', 0],
  ['واحد', 1],
  ['اثنان', 2],
  ['ثلاثة', 3],
  ['عشرة', 10],
  ['أحد عشر', 11],
  ['اثنا عشر', 12],
  ['عشرون', 20],
  ['واحد و عشرون', 21],
  ['ثلاثون', 30],
  ['مائة', 100],
  ['مائة و سبعة و ثلاثون', 137],
  ['مائتان', 200],
  ['سبعمائة', 700],
  ['ألف', 1000],
  ['ألف و واحد', 1001],
  ['أربعة آلاف و ستمائة و ثمانون', 4680],
  ['ثلاثة و ستون ألف و ثمانمائة و اثنان و تسعون', 63892],
  ['سبعمائة و اثنان و تسعون ألف و خمسمائة و واحد و ثمانون', 792581],
  ['مليون', 1000000],
  ['اثنان مليون و سبعمائة و واحد و أربعون ألف و أربعة و ثلاثون', 2741034],
  ['ستة و ثمانون مليون و أربعمائة و تسعة و عشرون ألف و سبعمائة و ثلاثة و خمسون', 86429753],
  ['تسعمائة و خمسة و سبعون مليون و ثلاثمائة و عشرة آلاف و ثمانمائة و أربعة و ستون', 975310864],
  ['مليار', 1000000000],
  ['تسعة مليارات و ثمانمائة و ستة و سبعون مليون و خمسمائة و ثلاثة و أربعون ألف و مائتان و عشرة', 9876543210],
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
    row[0] = `سالب ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} درهم`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} درهم`;
      return;
    }
    row[0] = `سالب ${row[0]} درهم`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
