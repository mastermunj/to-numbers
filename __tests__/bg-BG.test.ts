import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import bgBg, { ToNumbers as LocaleToNumbers } from '../src/locales/bg-BG';

const localeCode = 'bg-BG';
const toNumbers = new ToNumbers({
  localeCode,
});

describe('Test Locale', () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toNumbers.getLocaleClass()).toBe(bgBg);
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
  const locale = new bgBg();
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
  ['Нула', 0],
  ['Едно', 1],
  ['Две', 2],
  ['Три', 3],
  ['Четири', 4],
  ['Пет', 5],
  ['Шест', 6],
  ['Седем', 7],
  ['Осем', 8],
  ['Девет', 9],
  ['Десет', 10],
  ['Единадесет', 11],
  ['Дванадесет', 12],
  ['Тринадесет', 13],
  ['Четиринадесет', 14],
  ['Петнадесет', 15],
  ['Шестнадесет', 16],
  ['Седемнадесет', 17],
  ['Осемнадесет', 18],
  ['Деветнадесет', 19],
  ['Двадесет', 20],
  ['Двадесет Едно', 21],
  ['Двадесет Две', 22],
  ['Тридесет', 30],
  ['Тридесет Пет', 35],
  ['Четиридесет', 40],
  ['Петдесет', 50],
  ['Шестдесет', 60],
  ['Седемдесет', 70],
  ['Осемдесет', 80],
  ['Деветдесет', 90],
  ['Деветдесет Девет', 99],
  ['Сто', 100],
  ['Сто Тридесет Седем', 137],
  ['Двеста', 200],
  ['Триста', 300],
  ['Четиристотин', 400],
  ['Петстотин', 500],
  ['Шестстотин', 600],
  ['Седемстотин', 700],
  ['Осемстотин', 800],
  ['Деветстотин', 900],
  ['Хиляда', 1000],
  ['Хиляда Сто', 1100],
  ['Две Хиляди', 2000],
  ['Три Хиляди', 3000],
  ['Четири Хиляди', 4000],
  ['Пет Хиляда', 5000],
  ['Четири Хиляди Шестстотин Осемдесет', 4680],
  ['Десет Хиляда', 10000],
  ['Шестдесет Три Хиляди Осемстотин Деветдесет Две', 63892],
  ['Сто Хиляди', 100000],
  ['Милион', 1000000],
  ['Две Милиона', 2000000],
  ['Пет Милион', 5000000],
  ['Две Милиона Седемстотин Четиридесет Едно Хиляди Тридесет Четири', 2741034],
  ['Милиард', 1000000000],
  ['Две Милиарда', 2000000000],
  ['Пет Милиард', 5000000000],
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
  ['Нула', 0],
  ['Нула Цяло Нула Четири', 0.04],
  ['Нула Цяло Четири', 0.4],
  ['Нула Цяло Шестдесет Три', 0.63],
  ['Тридесет Седем Цяло Нула Шест', 37.06],
  ['Тридесет Седем Цяло Шестдесет Осем', 37.68],
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
  const locale = new bgBg();
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
  const locale = new bgBg();
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
