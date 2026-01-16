import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/mr-IN';

const localeCode = 'mr-IN';
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

// mr-IN uses Indian numbering system (Lakh, Crore)
const testIntegers: [string, number][] = [
  ['शून्य', 0],
  ['एक', 1],
  ['दोन', 2],
  ['तीन', 3],
  ['चार', 4],
  ['पाच', 5],
  ['सहा', 6],
  ['सात', 7],
  ['आठ', 8],
  ['नऊ', 9],
  ['दहा', 10],
  ['अकरा', 11],
  ['बारा', 12],
  ['तेरा', 13],
  ['चौदा', 14],
  ['पंधरा', 15],
  ['सोळा', 16],
  ['सतरा', 17],
  ['अठरा', 18],
  ['एकोणीस', 19],
  ['वीस', 20],
  ['एकवीस', 21],
  ['तीस', 30],
  ['चाळीस', 40],
  ['पन्नास', 50],
  ['साठ', 60],
  ['सत्तर', 70],
  ['ऐंशी', 80],
  ['नव्वद', 90],
  ['एकशे', 100],
  ['एकशे सदतीस', 137],
  ['दोनशे', 200],
  ['सातशे', 700],
  ['एक हजार', 1000],
  ['एक हजार एकशे', 1100],
  ['दोन हजार एकशे', 2100],
  ['चार हजार सहाशे ऐंशी', 4680],
  ['दहा हजार', 10000],
  ['त्रेसष्ठ हजार आठशे ब्याण्णव', 63892],
  ['एक लाख', 100000],
  ['सात लाख ब्याण्णव हजार पाचशे एक्क्याऐंशी', 792581],
  ['सत्तावीस लाख एक्केचाळीस हजार चौतीस', 2741034],
  ['एक कोटी', 10000000],
  ['आठ कोटी चौसष्ठ लाख एकोणतीस हजार सातशे त्रेपन्न', 86429753],
  ['सत्त्याण्णव कोटी त्रेपन्न लाख दहा हजार आठशे चौसष्ठ', 975310864],
  ['नऊशे सत्त्याऐंशी कोटी पासष्ठ लाख त्रेचाळीस हजार दोनशे दहा', 9876543210],
  ['नऊ हजार आठशे शहात्तर कोटी चोपन्न लाख बत्तीस हजार एकशे एक', 98765432101],
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
    row[0] = `वजा ${row[0]}`;
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
    row[0] = `वजा ${row[0]} रुपये`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Numbers', () => {
  const additionalNumbers: [string, number][] = [
    ['बावीस', 22],
    ['तेवीस', 23],
    ['चोवीस', 24],
    ['पंचवीस', 25],
    ['सव्वीस', 26],
    ['सत्तावीस', 27],
    ['अठ्ठावीस', 28],
    ['एकोणतीस', 29],
    ['एकतीस', 31],
    ['पस्तीस', 35],
  ];

  test.concurrent.each(additionalNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
