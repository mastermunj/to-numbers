import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import roRo, { ToNumbers as LocaleToNumbers } from '../src/locales/ro-RO';

const localeCode = 'ro-RO';
const toNumbers = new ToNumbers({
  localeCode,
});

describe('Test Locale', () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toNumbers.getLocaleClass()).toBe(roRo);
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
  const locale = new roRo();
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
  ['Zero', 0],
  ['O Sută Treizeci Șapte', 137],
  ['Șapte Sute', 700],
  ['O Mie O Sută', 1100],
  ['Patru Mii Șase Sute Optzeci', 4680],
  ['Șaizeci Trei Mii Opt Sute Nouăzeci Două', 63892],
  ['Optzeci Șase Mii O Sută', 86100],
  ['Șapte Sute Nouăzeci Două Mii Cinci Sute Optzeci Unu', 792581],
  ['Două Milioane Șapte Sute Patruzeci Unu Mii Treizeci Patru', 2741034],
  ['Optzeci Șase Milioane Patru Sute Douăzeci Nouă Mii Șapte Sute Cincizeci Trei', 86429753],
  ['Nouă Sute Șaptezeci Cinci Milioane Trei Sute Zece Mii Opt Sute Șaizeci Patru', 975310864],
  ['Nouă Miliarde Opt Sute Șaptezeci Șase Milioane Cinci Sute Patruzeci Trei Mii Două Sute Zece', 9876543210],
  ['Nouăzeci Opt Miliarde Șapte Sute Șaizeci Cinci Milioane Patru Sute Treizeci Două Mii O Sută Unu', 98765432101],
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
  const locale = new roRo();
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
  const locale = new roRo();
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
  const locale = new roRo();
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
  const locale = new roRo();
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
  const locale = new roRo();
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
  const locale = new roRo();
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
  const locale = new roRo();
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
  const locale = new roRo();
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
  const locale = new roRo();
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
  const locale = new roRo();
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
  ['Zero', 0],
  ['Zero Virgulă Zero Patru', 0.04],
  ['Zero Virgulă Zero Patru Șase Opt', 0.0468],
  ['Zero Virgulă Patru', 0.4],
  ['Zero Virgulă Șaizeci Trei', 0.63],
  ['Zero Virgulă Nouă Sute Șaptezeci Trei', 0.973],
  ['Zero Virgulă Nouă Sute Nouăzeci Nouă', 0.999],
  ['Treizeci Șapte Virgulă Zero Șase', 37.06],
  ['Treizeci Șapte Virgulă Zero Șase Opt', 37.068],
  ['Treizeci Șapte Virgulă Șaizeci Opt', 37.68],
  ['Treizeci Șapte Virgulă Șase Sute Optzeci Trei', 37.683],
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
  const locale = new roRo();
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
  const locale = new roRo();
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
