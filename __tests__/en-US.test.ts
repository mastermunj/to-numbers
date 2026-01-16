import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import enUs from '../src/locales/en-US';

const localeCode = 'en-US';
const toNumbers = new ToNumbers({
  localeCode,
});

describe('Test Locale', () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toNumbers.getLocaleClass()).toBe(enUs);
  });
});

// Test data: [words, expected number]
const testIntegers: [string, number][] = [
  ['Zero', 0],
  ['One Hundred Thirty Seven', 137],
  ['Seven Hundred', 700],
  ['One Thousand One Hundred', 1100],
  ['Four Thousand Six Hundred Eighty', 4680],
  ['Sixty Three Thousand Eight Hundred Ninety Two', 63892],
  ['Eighty Six Thousand One Hundred', 86100],
  ['Seven Hundred Ninety Two Thousand Five Hundred Eighty One', 792581],
  ['Two Million Seven Hundred Forty One Thousand Thirty Four', 2741034],
  ['Eighty Six Million Four Hundred Twenty Nine Thousand Seven Hundred Fifty Three', 86429753],
  ['Nine Hundred Seventy Five Million Three Hundred Ten Thousand Eight Hundred Sixty Four', 975310864],
  ['Nine Billion Eight Hundred Seventy Six Million Five Hundred Forty Three Thousand Two Hundred Ten', 9876543210],
];

describe('Test Integers with options = {}', () => {
  test.concurrent.each(testIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Case Insensitivity', () => {
  test.concurrent.each(testIntegers)('convert lowercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toLowerCase())).toBe(expected);
  });
});

describe('Test Negative Integers with options = {}', () => {
  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.map((row, i) => {
    if (i === 0) {
      return;
    }
    row[0] = `Minus ${row[0]}`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true }', () => {
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.map((row) => {
    row[0] = `${row[0]} Dollars Only`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

const testFloats: [string, number][] = [
  ['Zero', 0.0],
  ['Zero Point Zero Four', 0.04],
  ['Zero Point Four', 0.4],
  ['Zero Point Sixty Three', 0.63],
  ['Thirty Seven Point Zero Six', 37.06],
  ['Thirty Seven Point Sixty Eight', 37.68],
];

describe('Test Floats with options = {}', () => {
  test.concurrent.each(testFloats)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

const testFloatsWithCurrency: [string, number][] = [
  ['Zero Dollars Only', 0.0],
  ['Zero Dollars And One Cent Only', 0.01],
  ['Zero Dollars And Four Cents Only', 0.04],
  ['Zero Dollars And Forty Cents Only', 0.4],
  ['Zero Dollars And Sixty Three Cents Only', 0.63],
  ['Thirty Seven Dollars And Six Cents Only', 37.06],
  ['Thirty Seven Dollars And Sixty Eight Cents Only', 37.68],
];

describe('Test Floats with options = { currency: true }', () => {
  test.concurrent.each(testFloatsWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Scale Words', () => {
  const scaleNumbers: [string, number][] = [
    ['One Thousand', 1000],
    ['Ten Thousand', 10000],
    ['One Hundred Thousand', 100000],
    ['One Million', 1000000],
    ['Ten Million', 10000000],
    ['One Hundred Million', 100000000],
    ['One Billion', 1000000000],
    ['One Trillion', 1000000000000],
  ];

  test.concurrent.each(scaleNumbers)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
