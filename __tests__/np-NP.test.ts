import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/np-NP';

const localeCode = 'np-NP';
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

// np-NP uses extended Indian numbering system (Lakh, Crore, Arab, Kharab)
const testIntegers: [string, number][] = [
  ['शून्य', 0],
  ['एक', 1],
  ['दुई', 2],
  ['तीन', 3],
  ['चार', 4],
  ['पाँच', 5],
  ['छ', 6],
  ['सात', 7],
  ['आठ', 8],
  ['नौ', 9],
  ['दश', 10],
  ['एघार', 11],
  ['बाह्र', 12],
  ['तेह्र', 13],
  ['चौध', 14],
  ['पन्ध्र', 15],
  ['सोह्र', 16],
  ['सत्र', 17],
  ['अठार', 18],
  ['उन्नाइस', 19],
  ['बीस', 20],
  ['एक्काइस', 21],
  ['तीस', 30],
  ['चालीस', 40],
  ['पचास', 50],
  ['साठी', 60],
  ['सत्तरी', 70],
  ['अस्सी', 80],
  ['नब्बे', 90],
  ['एक सय', 100],
  ['एक सय सैंतीस', 137],
  ['दुई सय', 200],
  ['सात सय', 700],
  ['एक हजार', 1000],
  ['एक हजार एक सय', 1100],
  ['चार हजार छ सय अस्सी', 4680],
  ['दश हजार', 10000],
  ['त्रिसट्ठी हजार आठ सय बयान्नब्बे', 63892],
  ['छयासी हजार एक सय', 86100],
  ['एक लाख', 100000],
  ['सात लाख बयान्नब्बे हजार पाँच सय एकासी', 792581],
  ['सत्ताइस लाख एकचालीस हजार चौँतीस', 2741034],
  ['एक करोड', 10000000],
  ['आठ करोड चौंसट्ठी लाख उनन्तिस हजार सात सय त्रिपन्न', 86429753],
  ['सन्तानब्बे करोड त्रिपन्न लाख दश हजार आठ सय चौंसट्ठी', 975310864],
  ['नौ अर्ब सतासी करोड पैंसट्ठी लाख त्रिचालीस हजार दुई सय दश', 9876543210],
  ['अन्ठानब्बे अर्ब छयहत्तर करोड चवन्न लाख बत्तीस हजार एक सय एक', 98765432101],
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
    row[0] = `माइनस ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} रुपैयाँ`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} रुपैयाँ`;
      return;
    }
    row[0] = `माइनस ${row[0]} रुपैयाँ`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Numbers', () => {
  const additionalNumbers: [string, number][] = [
    ['बाइस', 22],
    ['तेइस', 23],
    ['चौबीस', 24],
    ['पच्चिस', 25],
    ['छब्बिस', 26],
    ['सत्ताइस', 27],
    ['अठ्ठाइस', 28],
    ['उनन्तिस', 29],
    ['एकतीस', 31],
    ['पैंतीस', 35],
  ];

  test.concurrent.each(additionalNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
