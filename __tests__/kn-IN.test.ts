import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import locale from '../src/locales/kn-IN';

const localeCode = 'kn-IN';
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
    expect(() => toNumbersWrongLocale.convert('ಒಂದು')).toThrow(/Unknown Locale/);
  });
});

// kn-IN uses Indian numbering system (Lakh, Crore)
const testIntegers: [string, number][] = [
  ['ಶೂನ್ಯ', 0],
  ['ಒಂದು', 1],
  ['ಎರಡು', 2],
  ['ಮೂರು', 3],
  ['ನಾಲ್ಕು', 4],
  ['ಐದು', 5],
  ['ಆರು', 6],
  ['ಏಳು', 7],
  ['ಎಂಟು', 8],
  ['ಒಂಬತ್ತು', 9],
  ['ಹತ್ತು', 10],
  ['ಹನ್ನೊಂದು', 11],
  ['ಹನ್ನೆರಡು', 12],
  ['ಹದಿಮೂರು', 13],
  ['ಹದಿನಾಲ್ಕು', 14],
  ['ಹದಿನೈದು', 15],
  ['ಹದಿನಾರು', 16],
  ['ಹದಿನೇಳು', 17],
  ['ಹದಿನೆಂಟು', 18],
  ['ಹತ್ತೊಂಬತ್ತು', 19],
  ['ಇಪ್ಪತ್ತು', 20],
  ['ಇಪ್ಪತ್ತೊಂದು', 21],
  ['ಮೂವತ್ತು', 30],
  ['ನಲವತ್ತು', 40],
  ['ಐವತ್ತು', 50],
  ['ಅರುವತ್ತು', 60],
  ['ಎಪ್ಪತ್ತು', 70],
  ['ಎಂಭತ್ತು', 80],
  ['ತೊಂಬತ್ತು', 90],
  ['ಒಂದು ನೂರು', 100],
  ['ಒಂದು ನೂರು ಮೂವತ್ತೇಳು', 137],
  ['ಎರಡು ನೂರು', 200],
  ['ಏಳು ನೂರು', 700],
  ['ಒಂದು ಸಾವಿರ', 1000],
  ['ಒಂದು ಸಾವಿರ ಒಂದು ನೂರು', 1100],
  ['ನಾಲ್ಕು ಸಾವಿರ ಆರು ನೂರು ಎಂಭತ್ತು', 4680],
  ['ಹತ್ತು ಸಾವಿರ', 10000],
  ['ಅರುವತ್ತಮೂರು ಸಾವಿರ ಎಂಟು ನೂರು ತೊಂಬತ್ತೆರಡು', 63892],
  ['ಒಂದು ಲಕ್ಷ', 100000],
  ['ಏಳು ಲಕ್ಷ ತೊಂಬತ್ತೆರಡು ಸಾವಿರ ಐದು ನೂರು ಎಂಭತ್ತೊಂದು', 792581],
  ['ಇಪ್ಪತ್ತೇಳು ಲಕ್ಷ ನಲವತ್ತೊಂದು ಸಾವಿರ ಮೂವತ್ತನಾಲ್ಕು', 2741034],
  ['ಒಂದು ಕೋಟಿ', 10000000],
  ['ಎಂಟು ಕೋಟಿ ಅರುವತ್ತನಾಲ್ಕು ಲಕ್ಷ ಇಪ್ಪತ್ತೊಂಬತ್ತು ಸಾವಿರ ಏಳು ನೂರು ಐವತ್ತಮೂರು', 86429753],
  ['ತೊಂಬತ್ತೇಳು ಕೋಟಿ ಐವತ್ತಮೂರು ಲಕ್ಷ ಹತ್ತು ಸಾವಿರ ಎಂಟು ನೂರು ಅರುವತ್ತನಾಲ್ಕು', 975310864],
  ['ಒಂಬತ್ತು ನೂರು ಎಂಭತ್ತೇಳು ಕೋಟಿ ಅರುವತ್ತೈದು ಲಕ್ಷ ನಲವತ್ತಮೂರು ಸಾವಿರ ಎರಡು ನೂರು ಹತ್ತು', 9876543210],
  ['ಒಂಬತ್ತು ಸಾವಿರ ಎಂಟು ನೂರು ಎಪ್ಪತ್ತಾರು ಕೋಟಿ ಐವತ್ತನಾಲ್ಕು ಲಕ್ಷ ಮೂವತ್ತೆರಡು ಸಾವಿರ ಒಂದು ನೂರು ಒಂದು', 98765432101],
  ['ತೊಂಬತ್ತೆಂಟು ಸಾವಿರ ಏಳು ನೂರು ಅರುವತ್ತೈದು ಕೋಟಿ ನಲವತ್ತಮೂರು ಲಕ್ಷ ಇಪ್ಪತ್ತೊಂದು ಸಾವಿರ ಹನ್ನೆರಡು', 987654321012],
  [
    'ಒಂಬತ್ತು ಲಕ್ಷ ಎಂಭತ್ತೇಳು ಸಾವಿರ ಆರು ನೂರು ಐವತ್ತನಾಲ್ಕು ಕೋಟಿ ಮೂವತ್ತೆರಡು ಲಕ್ಷ ಹತ್ತು ಸಾವಿರ ಒಂದು ನೂರು ಇಪ್ಪತ್ತಮೂರು',
    9876543210123,
  ],
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
    row[0] = `ಋಣ ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} ರೂಪಾಯಿಗಳು`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.map((row, i) => {
    if (i === 0) {
      row[0] = `${row[0]} ರೂಪಾಯಿಗಳು`;
      return;
    }
    row[0] = `ಋಣ ${row[0]} ರೂಪಾಯಿಗಳು`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Additional Numbers', () => {
  const additionalNumbers: [string, number][] = [
    ['ಇಪ್ಪತ್ತೆರಡು', 22],
    ['ಇಪ್ಪತ್ತಮೂರು', 23],
    ['ಇಪ್ಪತ್ತನಾಲ್ಕು', 24],
    ['ಇಪ್ಪತ್ತೈದು', 25],
    ['ಇಪ್ಪತ್ತಾರು', 26],
    ['ಇಪ್ಪತ್ತೇಳು', 27],
    ['ಇಪ್ಪತ್ತೆಂಟು', 28],
    ['ಇಪ್ಪತ್ತೊಂಬತ್ತು', 29],
    ['ಮೂವತ್ತೊಂದು', 31],
    ['ಮೂವತ್ತೈದು', 35],
  ];

  test.concurrent.each(additionalNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
