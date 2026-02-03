import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import knIn, { ToNumbers as LocaleToNumbers } from '../src/locales/kn-IN';

const localeCode = 'kn-IN';
const toNumbers = new ToNumbers({
  localeCode,
});

describe('Test Locale', () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toNumbers.getLocaleClass()).toBe(knIn);
  });

  test(`Per-locale ToNumbers class: ${localeCode}`, () => {
    const localeTn = new LocaleToNumbers();
    expect(localeTn.convert('0')).toBeDefined();
  });

  const wrongLocaleCode = localeCode + '-wrong';
  test(`Wrong Locale: ${wrongLocaleCode}`, () => {
    const toNumbersWrongLocale = new ToNumbers({
      localeCode: wrongLocaleCode,
    });
    expect(() => toNumbersWrongLocale.convert('One')).toThrow(/Unknown Locale/);
  });
});

// Test basic numbers from locale config (0-99, 100, 1000, etc.)
describe('Test Basic Numbers from Locale Config', () => {
  const locale = new knIn();
  const config = locale.config;

  // Get all mappable entries from numberWordsMapping (exclude bigint values)
  // When there are duplicate words, keep the LAST occurrence (lower number)
  // because the tokenizer matches smaller numbers first when words are the same
  const wordToEntry = new Map<string, { number: number; value: string }>();
  config.numberWordsMapping
    .filter((entry) => entry && entry.value && typeof entry.number === 'number' && entry.number <= 1e15)
    .forEach((entry) => {
      const lowerValue = entry.value.toLowerCase();
      wordToEntry.set(lowerValue, entry);
    });

  const basicTests: [string, number][] = Array.from(wordToEntry.values()).map(
    (entry) => [entry.value, entry.number] as [string, number],
  );

  test.concurrent.each(basicTests)('basic: "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

// Test data: [words, expected number]
const testIntegers: [string, number][] = [
  ['ಶೂನ್ಯ', 0],
  ['ಒಂದು ನೂರು ಮೂವತ್ತೇಳು', 137],
  ['ಏಳು ನೂರು', 700],
  ['ನಾಲ್ಕು ಸಾವಿರ ಆರು ನೂರು ಎಂಭತ್ತು', 4680],
  ['ಅರುವತ್ತಮೂರು ಸಾವಿರ ಎಂಟು ನೂರು ತೊಂಬತ್ತೆರಡು', 63892],
  ['ಏಳು ಲಕ್ಷ ತೊಂಬತ್ತೆರಡು ಸಾವಿರ ಐದು ನೂರು ಎಂಭತ್ತೊಂದು', 792581],
  ['ಇಪ್ಪತ್ತೇಳು ಲಕ್ಷ ನಲವತ್ತೊಂದು ಸಾವಿರ ಮೂವತ್ತನಾಲ್ಕು', 2741034],
  ['ಎಂಟು ಕೋಟಿ ಅರುವತ್ತನಾಲ್ಕು ಲಕ್ಷ ಇಪ್ಪತ್ತೊಂಬತ್ತು ಸಾವಿರ ಏಳು ನೂರು ಐವತ್ತಮೂರು', 86429753],
  ['ತೊಂಬತ್ತೇಳು ಕೋಟಿ ಐವತ್ತಮೂರು ಲಕ್ಷ ಹತ್ತು ಸಾವಿರ ಎಂಟು ನೂರು ಅರುವತ್ತನಾಲ್ಕು', 975310864],
  ['ಒಂಬತ್ತು ಅರಬ್ ಎಂಭತ್ತೇಳು ಕೋಟಿ ಅರುವತ್ತೈದು ಲಕ್ಷ ನಲವತ್ತಮೂರು ಸಾವಿರ ಎರಡು ನೂರು ಹತ್ತು', 9876543210],
  ['ತೊಂಬತ್ತೆಂಟು ಅರಬ್ ಎಪ್ಪತ್ತಾರು ಕೋಟಿ ಐವತ್ತನಾಲ್ಕು ಲಕ್ಷ ಮೂವತ್ತೆರಡು ಸಾವಿರ ಒಂದು ನೂರು ಒಂದು', 98765432101],
  ['ಒಂಬತ್ತು ಖರಬ್ ಎಂಭತ್ತೇಳು ಅರಬ್ ಅರುವತ್ತೈದು ಕೋಟಿ ನಲವತ್ತಮೂರು ಲಕ್ಷ ಇಪ್ಪತ್ತೊಂದು ಸಾವಿರ ಹನ್ನೆರಡು', 987654321012],
];

describe('Test Integers with options = {}', () => {
  test.concurrent.each(testIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Case Insensitivity - Lowercase', () => {
  test.concurrent.each(testIntegers)('convert lowercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toLowerCase())).toBe(expected);
  });
});

describe('Test Case Insensitivity - Uppercase', () => {
  test.concurrent.each(testIntegers)('convert uppercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toUpperCase())).toBe(expected);
  });
});

describe('Test Negative Integers with options = {}', () => {
  const locale = new knIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.forEach((row, i) => {
    if (i === 0 || row[1] === 0) {
      return;
    }
    row[0] = `${minusWord} ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Integers - Lowercase', () => {
  const locale = new knIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.forEach((row, i) => {
    if (i === 0 || row[1] === 0) {
      return;
    }
    row[0] = `${minusWord} ${row[0]}`.toLowerCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Integers - Uppercase', () => {
  const locale = new knIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.forEach((row, i) => {
    if (i === 0 || row[1] === 0) {
      return;
    }
    row[0] = `${minusWord} ${row[0]}`.toUpperCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const locale = new knIn();
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    row[0] = `${row[0]}${suffix}`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true, doNotAddOnly: true }', () => {
  const locale = new knIn();
  const currency = locale.config.currency;

  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    row[0] = `${row[0]} ${currUnit}`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const locale = new knIn();
  const minusWord = locale.config.texts.minus;
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.forEach((row, i) => {
    const currUnit = row[1] === 1 || row[1] === -1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    if (i === 0 || row[1] === 0) {
      row[0] = `${row[0]}${suffix}`;
      return;
    }
    row[0] = `${minusWord} ${row[0]}${suffix}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true, doNotAddOnly: true }', () => {
  const locale = new knIn();
  const minusWord = locale.config.texts.minus;
  const currency = locale.config.currency;

  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.forEach((row, i) => {
    const currUnit = row[1] === 1 || row[1] === -1 ? currency.singular : currency.plural;
    if (i === 0 || row[1] === 0) {
      row[0] = `${row[0]} ${currUnit}`;
      return;
    }
    row[0] = `${minusWord} ${row[0]} ${currUnit}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Currency - Lowercase', () => {
  const locale = new knIn();
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    row[0] = `${row[0]}${suffix}`.toLowerCase();
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Currency - Uppercase', () => {
  const locale = new knIn();
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    row[0] = `${row[0]}${suffix}`.toUpperCase();
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Currency - Lowercase', () => {
  const locale = new knIn();
  const minusWord = locale.config.texts.minus;
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';

  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.forEach((row, i) => {
    const currUnit = row[1] === 1 || row[1] === -1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? ` ${currUnit} ${onlyWord}` : ` ${currUnit}`;
    if (i === 0 || row[1] === 0) {
      row[0] = `${row[0]}${suffix}`.toLowerCase();
      return;
    }
    row[0] = `${minusWord} ${row[0]}${suffix}`.toLowerCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['ಶೂನ್ಯ', 0],
  ['ಶೂನ್ಯ ದಶಾಂಶ ಶೂನ್ಯ ನಾಲ್ಕು', 0.04],
  ['ಶೂನ್ಯ ದಶಾಂಶ ಶೂನ್ಯ ನಾಲ್ಕು ಆರು ಎಂಟು', 0.0468],
  ['ಶೂನ್ಯ ದಶಾಂಶ ನಾಲ್ಕು', 0.4],
  ['ಶೂನ್ಯ ದಶಾಂಶ ಅರುವತ್ತಮೂರು', 0.63],
  ['ಶೂನ್ಯ ದಶಾಂಶ ಒಂಬತ್ತು ನೂರು ಎಪ್ಪತ್ತಮೂರು', 0.973],
  ['ಶೂನ್ಯ ದಶಾಂಶ ಒಂಬತ್ತು ನೂರು ತೊಂಬತ್ತೊಂಬತ್ತು', 0.999],
  ['ಮೂವತ್ತೇಳು ದಶಾಂಶ ಶೂನ್ಯ ಆರು', 37.06],
  ['ಮೂವತ್ತೇಳು ದಶಾಂಶ ಶೂನ್ಯ ಆರು ಎಂಟು', 37.068],
  ['ಮೂವತ್ತೇಳು ದಶಾಂಶ ಅರುವತ್ತೆಂಟು', 37.68],
  ['ಮೂವತ್ತೇಳು ದಶಾಂಶ ಆರು ನೂರು ಎಂಭತ್ತಮೂರು', 37.683],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Floats - Lowercase', () => {
  test.concurrent.each(testFloats)('convert lowercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toLowerCase())).toBe(expected);
  });
});

describe('Test Floats - Uppercase', () => {
  test.concurrent.each(testFloats)('convert uppercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toUpperCase())).toBe(expected);
  });
});

describe('Test Negative Floats', () => {
  const locale = new knIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeFloats: [string, number][] = cloneDeep(testFloats);
  testNegativeFloats.forEach((row, i) => {
    if (i === 0 || row[1] === 0) return;
    row[0] = `${minusWord} ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeFloats.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Floats - Lowercase', () => {
  const locale = new knIn();
  const minusWord = locale.config.texts.minus;

  const testNegativeFloats: [string, number][] = cloneDeep(testFloats);
  testNegativeFloats.forEach((row, i) => {
    if (i === 0 || row[1] === 0) return;
    row[0] = `${minusWord} ${row[0]}`.toLowerCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeFloats.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

// Ordinal number tests
const testOrdinals: [string, number][] = [
  ['ಮೊದಲನೆಯ', 1],
  ['ಎರಡನೆಯ', 2],
  ['ಮೂರನೆಯ', 3],
  ['ನಾಲ್ಕನೆಯ', 4],
  ['ಐದನೆಯ', 5],
  ['ಆರನೆಯ', 6],
  ['ಏಳನೆಯ', 7],
  ['ಎಂಟನೆಯ', 8],
  ['ಒಂಬತ್ತನೆಯ', 9],
  ['ಹತ್ತನೆಯ', 10],
];

describe('Test Ordinal Numbers', () => {
  test.concurrent.each(testOrdinals)('convert ordinal "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Ordinal Parse Result', () => {
  test('parse returns isOrdinal true for ordinal input', () => {
    const result = toNumbers.parse('ಮೊದಲನೆಯ');
    expect(result.value).toBe(1);
    expect(result.isOrdinal).toBe(true);
    expect(result.isCurrency).toBe(false);
  });

  test('parse returns isOrdinal undefined for cardinal input', () => {
    const result = toNumbers.parse('ಒಂದು');
    expect(result.value).toBe(1);
    expect(result.isOrdinal).toBeUndefined();
  });
});
