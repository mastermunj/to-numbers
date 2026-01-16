import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/hi-IN';

const localeCode = 'hi-IN';
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
    expect(() => toNumbersWrongLocale.convert('एक')).toThrow(/Unknown Locale/);
  });
});

// Test data: [words, expected number]
const testIntegers: [string, number][] = [
  ['शून्य', 0],
  ['एक सौ सैंतीस', 137],
  ['सात सौ', 700],
  ['चार हज़ार छह सौ अस्सी', 4680],
  ['तिरसठ हज़ार आठ सौ बानवे', 63892],
  ['सात लाख बानवे हज़ार पांच सौ इक्यासी', 792581],
  ['सत्ताईस लाख इकतालीस हज़ार चौंतीस', 2741034],
  ['आठ करोड़ चौंसठ लाख उनतीस हज़ार सात सौ तिरेपन', 86429753],
  ['सत्तानवे करोड़ तिरेपन लाख दस हज़ार आठ सौ चौंसठ', 975310864],
  ['नौ सौ सतासी करोड़ पैंसठ लाख तैंतालीस हज़ार दो सौ दस', 9876543210],
  ['नौ हज़ार आठ सौ छिहत्तर करोड़ चौबन लाख बत्तीस हज़ार एक सौ एक', 98765432101],
  ['अट्ठानवे हज़ार सात सौ पैंसठ करोड़ तैंतालीस लाख इक्कीस हज़ार बारह', 987654321012],
  ['नौ लाख सतासी हज़ार छह सौ चौबन करोड़ बत्तीस लाख दस हज़ार एक सौ तेईस', 9876543210123],
  ['अट्ठानवे लाख छिहत्तर हज़ार पांच सौ तैंतालीस करोड़ इक्कीस लाख एक हज़ार दो सौ चौंतीस', 98765432101234],
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
    row[0] = `ऋण ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} रुपये`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} रुपये`;
      return;
    }
    row[0] = `ऋण ${row[0]} रुपये`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['शून्य', 0.0],
  ['शून्य दशांश शून्य चार', 0.04],
  ['शून्य दशांश शून्य चार छह आठ', 0.0468],
  ['शून्य दशांश चार', 0.4],
  ['शून्य दशांश तिरसठ', 0.63],
  ['शून्य दशांश नौ सौ तिहत्तर', 0.973],
  ['शून्य दशांश नौ सौ निन्यानवे', 0.999],
  ['सैंतीस दशांश शून्य छह', 37.06],
  ['सैंतीस दशांश शून्य छह आठ', 37.068],
  ['सैंतीस दशांश अड़सठ', 37.68],
  ['सैंतीस दशांश छह सौ तिरासी', 37.683],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

const testFloatsWithCurrency: [string, number][] = [
  ['शून्य रुपये', 0.0],
  ['शून्य रुपये और चार पैसे', 0.04],
  ['शून्य रुपये और पांच पैसे', 0.05],
  ['शून्य रुपये और चालीस पैसे', 0.4],
  ['शून्य रुपये और तिरसठ पैसे', 0.63],
  ['शून्य रुपये और सत्तानवे पैसे', 0.97],
  ['सैंतीस रुपये और छह पैसे', 37.06],
  ['सैंतीस रुपये और सात पैसे', 37.07],
  ['सैंतीस रुपये और अड़सठ पैसे', 37.68],
];

describe('Test Floats with options = { currency: true }', () => {
  test.concurrent.each(testFloatsWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Simple Numbers', () => {
  const simpleNumbers: [string, number][] = [
    ['एक', 1],
    ['दो', 2],
    ['तीन', 3],
    ['चार', 4],
    ['पांच', 5],
    ['छह', 6],
    ['सात', 7],
    ['आठ', 8],
    ['नौ', 9],
    ['दस', 10],
    ['ग्यारह', 11],
    ['बारह', 12],
    ['तेरह', 13],
    ['चौदह', 14],
    ['पंद्रह', 15],
    ['सोलह', 16],
    ['सत्रह', 17],
    ['अठारह', 18],
    ['उन्नीस', 19],
    ['बीस', 20],
    ['इक्कीस', 21],
    ['तीस', 30],
    ['चालीस', 40],
    ['पचास', 50],
    ['साठ', 60],
    ['सत्तर', 70],
    ['अस्सी', 80],
    ['नब्बे', 90],
    ['निन्यानवे', 99],
    ['सौ', 100],
  ];

  test.concurrent.each(simpleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
