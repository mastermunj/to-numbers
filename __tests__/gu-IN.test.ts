import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/gu-IN';

const localeCode = 'gu-IN';
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
    expect(() => toNumbersWrongLocale.convert('એક')).toThrow(/Unknown Locale/);
  });
});

// gu-IN uses Indian numbering system (Lakh, Crore)
const testIntegers: [string, number][] = [
  ['શૂન્ય', 0],
  ['એક', 1],
  ['બે', 2],
  ['ત્રણ', 3],
  ['ચાર', 4],
  ['પાંચ', 5],
  ['છ', 6],
  ['સાત', 7],
  ['આઠ', 8],
  ['નવ', 9],
  ['દસ', 10],
  ['અગિયાર', 11],
  ['બાર', 12],
  ['તેર', 13],
  ['ચૌદ', 14],
  ['પંદર', 15],
  ['સોળ', 16],
  ['સત્તર', 17],
  ['અઢાર', 18],
  ['ઓગણિસ', 19],
  ['વીસ', 20],
  ['એકવીસ', 21],
  ['ત્રીસ', 30],
  ['ચાલીસ', 40],
  ['પચાસ', 50],
  ['સાઈઠ', 60],
  ['સિત્તેર', 70],
  ['એંસી', 80],
  ['નેવું', 90],
  ['એક સો', 100],
  ['એક સો સાડત્રીસ', 137],
  ['બે સો', 200],
  ['સાત સો', 700],
  ['એક હજાર', 1000],
  ['એક હજાર એક સો', 1100],
  ['ચાર હજાર છ સો એંસી', 4680],
  ['દસ હજાર', 10000],
  ['ત્રેસઠ હજાર આઠ સો બાણું', 63892],
  ['એક લાખ', 100000],
  ['સાત લાખ બાણું હજાર પાંચ સો એક્યાસી', 792581],
  ['સત્તાવીસ લાખ એકતાલીસ હજાર ચોત્રીસ', 2741034],
  ['એક કરોડ', 10000000],
  ['આઠ કરોડ ચોસઠ લાખ ઓગણત્રીસ હજાર સાત સો ત્રેપન', 86429753],
  ['સત્તાણું કરોડ ત્રેપન લાખ દસ હજાર આઠ સો ચોસઠ', 975310864],
  ['નવ સો સિત્યાસી કરોડ પાંસઠ લાખ ત્રેતાલીસ હજાર બે સો દસ', 9876543210],
  ['નવ હજાર આઠ સો છોતેર કરોડ ચોપન લાખ બત્રીસ હજાર એક સો એક', 98765432101],
  ['અઠ્ઠાણું હજાર સાત સો પાંસઠ કરોડ ત્રેતાલીસ લાખ એકવીસ હજાર બાર', 987654321012],
  ['નવ લાખ સિત્યાસી હજાર છ સો ચોપન કરોડ બત્રીસ લાખ દસ હજાર એક સો તેવીસ', 9876543210123],
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
    row[0] = `ઋણ ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} રૂપિયા`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} રૂપિયા`;
      return;
    }
    row[0] = `ઋણ ${row[0]} રૂપિયા`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Numbers', () => {
  const additionalNumbers: [string, number][] = [
    ['બાવીસ', 22],
    ['તેવીસ', 23],
    ['ચોવીસ', 24],
    ['પચ્ચીસ', 25],
    ['છવીસ', 26],
    ['સત્તાવીસ', 27],
    ['અઠ્ઠાવીસ', 28],
    ['ઓગણત્રીસ', 29],
    ['એકત્રીસ', 31],
    ['પાંત્રીસ', 35],
  ];

  test.concurrent.each(additionalNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
