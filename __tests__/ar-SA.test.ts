import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/ar-SA';

const localeCode = 'ar-SA';
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

// Test data: [words, expected number] - Arabic uses multi-word numbers
const testIntegers: [string, number][] = [
  ['صفر', 0],
  ['واحد', 1],
  ['اثنان', 2],
  ['ثلاثة', 3],
  ['أربعة', 4],
  ['خمسة', 5],
  ['ستة', 6],
  ['سبعة', 7],
  ['ثمانية', 8],
  ['تسعة', 9],
  ['عشرة', 10],
  ['أحد عشر', 11],
  ['اثنا عشر', 12],
  ['ثلاثة عشر', 13],
  ['أربعة عشر', 14],
  ['خمسة عشر', 15],
  ['ستة عشر', 16],
  ['سبعة عشر', 17],
  ['ثمانية عشر', 18],
  ['تسعة عشر', 19],
  ['عشرون', 20],
  ['واحد و عشرون', 21],
  ['خمسة و عشرون', 25],
  ['ثلاثون', 30],
  ['اثنان و أربعون', 42],
  ['خمسون', 50],
  ['تسعة و تسعون', 99],
  ['مائة', 100],
  ['مائة و سبعة و ثلاثون', 137],
  ['مائتان', 200],
  ['ثلاثمائة', 300],
  ['خمسمائة', 500],
  ['سبعمائة', 700],
  ['تسعمائة و تسعة و تسعون', 999],
  ['ألف', 1000],
  ['ألف و واحد', 1001],
  ['ألف و مائتان و أربعة و ثلاثون', 1234],
  ['أربعة آلاف و ستمائة و ثمانون', 4680],
  ['عشرة آلاف', 10000],
  ['ثلاثة و ستون ألف و ثمانمائة و اثنان و تسعون', 63892],
  ['مائة ألف', 100000],
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
    if (i === 0) {
      return;
    }
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
    row[0] = `${row[0]} ريال`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} ريال`;
      return;
    }
    row[0] = `سالب ${row[0]} ريال`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['صفر', 0.0],
  ['صفر فاصلة أربعة', 0.4],
  ['صفر فاصلة صفر أربعة', 0.04],
  ['صفر فاصلة ثلاثة و ستون', 0.63],
  ['صفر فاصلة تسعمائة و ثلاثة و سبعون', 0.973],
  ['صفر فاصلة تسعمائة و تسعة و تسعون', 0.999],
  ['سبعة و ثلاثون فاصلة صفر ستة', 37.06],
  ['سبعة و ثلاثون فاصلة ثمانية و ستون', 37.68],
  ['سبعة و ثلاثون فاصلة ستمائة و ثلاثة و ثمانون', 37.683],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

const testFloatsWithCurrency: [string, number][] = [
  ['صفر ريال', 0.0],
  ['صفر ريال و أربعون هللة', 0.4],
  ['صفر ريال و ثلاثة و ستون هللة', 0.63],
  ['صفر ريال و سبعة و تسعون هللة', 0.97],
  ['سبعة و ثلاثون ريال و ثمانية و ستون هللة', 37.68],
  ['مائة ريال', 100],
  ['ألف ريال و خمسون هللة', 1000.5],
];

describe('Test Floats with options = { currency: true }', () => {
  test.concurrent.each(testFloatsWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Scale Words', () => {
  const scaleNumbers: [string, number][] = [
    ['ألفان', 2000],
    ['ثلاثة آلاف', 3000],
    ['أربعة آلاف', 4000],
    ['خمسة آلاف', 5000],
    ['عشرة آلاف', 10000],
    ['مائة ألف', 100000],
    ['مليون', 1000000],
    ['مليونان', 2000000],
    ['ثلاثة ملايين', 3000000],
    ['مليار', 1000000000],
    ['ملياران', 2000000000],
    ['ثلاثة مليارات', 3000000000],
  ];

  test.concurrent.each(scaleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
