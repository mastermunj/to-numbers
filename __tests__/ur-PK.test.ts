import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/ur-PK';

const localeCode = 'ur-PK';
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
    expect(() => toNumbersWrongLocale.convert('ایک')).toThrow(/Unknown Locale/);
  });
});

// ur-PK uses Indian numbering system (Lakh, Crore)
const testIntegers: [string, number][] = [
  ['صفر', 0],
  ['ایک', 1],
  ['دو', 2],
  ['تین', 3],
  ['چار', 4],
  ['پانچ', 5],
  ['چھ', 6],
  ['سات', 7],
  ['آٹھ', 8],
  ['نو', 9],
  ['دس', 10],
  ['گیارہ', 11],
  ['بارہ', 12],
  ['تیرہ', 13],
  ['چودہ', 14],
  ['پندرہ', 15],
  ['سولہ', 16],
  ['سترہ', 17],
  ['اٹھارہ', 18],
  ['انیس', 19],
  ['بیس', 20],
  ['اکیس', 21],
  ['تیس', 30],
  ['چالیس', 40],
  ['پچاس', 50],
  ['ساٹھ', 60],
  ['ستر', 70],
  ['اسی', 80],
  ['نوے', 90],
  ['ایک سو', 100],
  ['ایک سو سینتیس', 137],
  ['دو سو', 200],
  ['سات سو', 700],
  ['ایک ہزار', 1000],
  ['ایک ہزار ایک سو', 1100],
  ['چار ہزار چھ سو اسی', 4680],
  ['دس ہزار', 10000],
  ['تریسٹھ ہزار آٹھ سو بانوے', 63892],
  ['چھیاسی ہزار ایک سو', 86100],
  ['ایک لاکھ', 100000],
  ['سات لاکھ بانوے ہزار پانچ سو اکیاسی', 792581],
  ['ستائیس لاکھ اکتالیس ہزار چونتیس', 2741034],
  ['ایک کروڑ', 10000000],
  ['آٹھ کروڑ چونسٹھ لاکھ انتیس ہزار سات سو ترپن', 86429753],
  ['ستانوے کروڑ ترپن لاکھ دس ہزار آٹھ سو چونسٹھ', 975310864],
  ['نو سو ستاسی کروڑ پینسٹھ لاکھ تینتالیس ہزار دو سو دس', 9876543210],
  ['نو ہزار آٹھ سو چھہتر کروڑ چون لاکھ بتیس ہزار ایک سو ایک', 98765432101],
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
    row[0] = `${row[0]} روپے`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} روپے`;
      return;
    }
    row[0] = `منفی ${row[0]} روپے`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Numbers', () => {
  const additionalNumbers: [string, number][] = [
    ['بائیس', 22],
    ['تئیس', 23],
    ['چوبیس', 24],
    ['پچیس', 25],
    ['چھبیس', 26],
    ['ستائیس', 27],
    ['اٹھائیس', 28],
    ['انتیس', 29],
    ['اکتیس', 31],
    ['پینتیس', 35],
  ];

  test.concurrent.each(additionalNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
