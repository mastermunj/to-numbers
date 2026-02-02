import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import plPl, { ToNumbers as LocaleToNumbers } from '../src/locales/pl-PL';

const localeCode = 'pl-PL';
const toNumbers = new ToNumbers({
  localeCode,
});

describe('Test Locale', () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toNumbers.getLocaleClass()).toBe(plPl);
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
  const locale = new plPl();
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
  ['Jeden', 1],
  ['Dwa', 2],
  ['Trzy', 3],
  ['Cztery', 4],
  ['Pięć', 5],
  ['Sześć', 6],
  ['Siedem', 7],
  ['Osiem', 8],
  ['Dziewięć', 9],
  ['Dziesięć', 10],
  ['Jedenaście', 11],
  ['Dwanaście', 12],
  ['Trzynaście', 13],
  ['Czternaście', 14],
  ['Piętnaście', 15],
  ['Szesnaście', 16],
  ['Siedemnaście', 17],
  ['Osiemnaście', 18],
  ['Dziewiętnaście', 19],
  ['Dwadzieścia', 20],
  ['Dwadzieścia Jeden', 21],
  ['Dwadzieścia Dwa', 22],
  ['Trzydzieści', 30],
  ['Trzydzieści Pięć', 35],
  ['Czterdzieści', 40],
  ['Pięćdziesiąt', 50],
  ['Sześćdziesiąt', 60],
  ['Siedemdziesiąt', 70],
  ['Osiemdziesiąt', 80],
  ['Dziewięćdziesiąt', 90],
  ['Dziewięćdziesiąt Dziewięć', 99],
  ['Sto', 100],
  ['Sto Trzydzieści Siedem', 137],
  ['Dwieście', 200],
  ['Trzysta', 300],
  ['Czterysta', 400],
  ['Pięćset', 500],
  ['Sześćset', 600],
  ['Siedemset', 700],
  ['Osiemset', 800],
  ['Dziewięćset', 900],
  ['Tysiąc', 1000],
  ['Tysiąc Sto', 1100],
  ['Dwa Tysiące', 2000],
  ['Trzy Tysiące', 3000],
  ['Cztery Tysiące', 4000],
  ['Pięć Tysiąc', 5000],
  ['Cztery Tysiące Sześćset Osiemdziesiąt', 4680],
  ['Dziesięć Tysiąc', 10000],
  ['Sześćdziesiąt Trzy Tysięcy Osiemset Dziewięćdziesiąt Dwa', 63892],
  ['Sto Tysięcy', 100000],
  ['Milion', 1000000],
  ['Dwa Miliony', 2000000],
  ['Pięć Milion', 5000000],
  ['Dwa Miliony Siedemset Czterdzieści Jeden Tysięcy Trzydzieści Cztery', 2741034],
  ['Miliard', 1000000000],
  ['Dwa Miliardy', 2000000000],
  ['Pięć Miliard', 5000000000],
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
  const locale = new plPl();
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
  const locale = new plPl();
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
  const locale = new plPl();
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
  const locale = new plPl();
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
  const locale = new plPl();
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
  const locale = new plPl();
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
  const locale = new plPl();
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
  const locale = new plPl();
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
  const locale = new plPl();
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
  const locale = new plPl();
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
  ['Zero Przecinek Zero Cztery', 0.04],
  ['Zero Przecinek Cztery', 0.4],
  ['Zero Przecinek Sześćdziesiąt Trzy', 0.63],
  ['Trzydzieści Siedem Przecinek Zero Sześć', 37.06],
  ['Trzydzieści Siedem Przecinek Sześćdziesiąt Osiem', 37.68],
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
  const locale = new plPl();
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
  const locale = new plPl();
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
