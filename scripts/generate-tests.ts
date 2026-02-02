/**
 * Script to generate to-numbers test files from to-words test files
 * This script reads test data from to-words and creates inverted test files for to-numbers
 *
 * Generates tests matching to-words test coverage:
 * - Basic integers
 * - Case insensitivity
 * - Negative integers
 * - Integers with currency
 * - Integers with currency (doNotAddOnly style - no "Only" suffix)
 * - Negative integers with currency
 * - Floats
 * - Floats with currency
 * - Ordinal numbers (where supported)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REFERENCE_DIR = path.join(__dirname, '..', 'reference-to-words', '__tests__');
const OUTPUT_DIR = path.join(__dirname, '..', '__tests__');
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');

interface TestData {
  integers: [number, string][];
  floats: [number, string][];
  floatsWithCurrency: [number, string][];
  ordinals: [number, string][];
}

// Get list of all locales
function getAllLocales(): string[] {
  return fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .map((f) => f.replace('.ts', ''));
}

// Extract test data from to-words test file
function extractTestData(localeCode: string): TestData | null {
  const testFile = path.join(REFERENCE_DIR, `${localeCode}.test.ts`);

  if (!fs.existsSync(testFile)) {
    console.warn(`No reference test file for ${localeCode}`);
    return null;
  }

  const content = fs.readFileSync(testFile, 'utf-8');

  const integers: [number, string][] = [];
  const floats: [number, string][] = [];
  const floatsWithCurrency: [number, string][] = [];
  const ordinals: [number, string][] = [];

  // Extract testIntegers array
  const integersMatch = content.match(/const testIntegers\s*(?::\s*[^=]+)?\s*=\s*\[([\s\S]*?)\];/);
  if (integersMatch) {
    const arrayContent = integersMatch[1];
    const pairRegex = /\[\s*(-?\d+)\s*,\s*['"`]([^'"`]+)['"`]\s*\]/g;
    let match;
    while ((match = pairRegex.exec(arrayContent)) !== null) {
      integers.push([parseInt(match[1], 10), match[2]]);
    }
  }

  // Extract testFloats array
  const floatsMatch = content.match(/const testFloats\s*(?::\s*[^=]+)?\s*=\s*\[([\s\S]*?)\];/);
  if (floatsMatch) {
    const arrayContent = floatsMatch[1];
    const pairRegex = /\[\s*([\d.]+)\s*,\s*['"`]([^'"`]+)['"`]\s*\]/g;
    let match;
    while ((match = pairRegex.exec(arrayContent)) !== null) {
      floats.push([parseFloat(match[1]), match[2]]);
    }
  }

  // Extract testFloatsWithCurrency array (handle backtick strings)
  const floatsWithCurrencyMatch = content.match(/const testFloatsWithCurrency\s*(?::\s*[^=]+)?\s*=\s*\[([\s\S]*?)\];/);
  if (floatsWithCurrencyMatch) {
    const arrayContent = floatsWithCurrencyMatch[1];
    // Match with backticks
    const pairRegex = /\[\s*([\d.]+)\s*,\s*`([^`]+)`\s*\]/g;
    let match;
    while ((match = pairRegex.exec(arrayContent)) !== null) {
      floatsWithCurrency.push([parseFloat(match[1]), match[2]]);
    }
  }

  // Extract testOrdinalNumbers array
  const ordinalsMatch = content.match(/const testOrdinalNumbers\s*(?::\s*[^=]+)?\s*=\s*\[([\s\S]*?)\];/);
  if (ordinalsMatch) {
    const arrayContent = ordinalsMatch[1];
    const pairRegex = /\[\s*(\d+)\s*,\s*['"`]([^'"`]+)['"`]\s*\]/g;
    let match;
    while ((match = pairRegex.exec(arrayContent)) !== null) {
      ordinals.push([parseInt(match[1], 10), match[2]]);
    }
  }

  return {
    integers,
    floats,
    floatsWithCurrency,
    ordinals,
  };
}

// Generate variable name from locale code (e.g., en-CA => enCa)
function toVarName(localeCode: string): string {
  return localeCode
    .split('-')
    .map((part, i) => (i === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()))
    .join('');
}

// Escape single quotes in strings
function escapeString(str: string): string {
  return str.replace(/'/g, "\\'");
}

// Format test arrays for output
function formatTestArray(arr: [string, number][]): string {
  return arr.map(([str, num]) => `  ['${escapeString(str)}', ${num}]`).join(',\n');
}

// Generate test file content
function generateTestFile(localeCode: string, data: TestData): string {
  const varName = toVarName(localeCode);

  // Swap the order: [number, string] -> [string, number]
  const testIntegers = data.integers.map(([num, str]) => [str, num] as [string, number]);
  const testFloats = data.floats.map(([num, str]) => [str, num] as [string, number]);
  //   const testFloatsWithCurrency = data.floatsWithCurrency.map(([num, str]) => [str, num] as [string, number]);
  //   const testOrdinals = data.ordinals.map(([num, str]) => [str, num] as [string, number]);

  let output = `import { describe, expect, test } from 'vitest';
import { cloneDeep } from 'lodash';
import { ToNumbers } from '../src/ToNumbers';
import ${varName}, { ToNumbers as LocaleToNumbers } from '../src/locales/${localeCode}';

const localeCode = '${localeCode}';
const toNumbers = new ToNumbers({
  localeCode,
});

describe('Test Locale', () => {
  test(\`Locale Class: \${localeCode}\`, () => {
    expect(toNumbers.getLocaleClass()).toBe(${varName});
  });

  test(\`Per-locale ToNumbers class: \${localeCode}\`, () => {
    const localeTn = new LocaleToNumbers();
    expect(localeTn.convert('0')).toBeDefined();
  });

  const wrongLocaleCode = localeCode + '-wrong';
  test(\`Wrong Locale: \${wrongLocaleCode}\`, () => {
    const toNumbersWrongLocale = new ToNumbers({
      localeCode: wrongLocaleCode,
    });
    expect(() => toNumbersWrongLocale.convert('One')).toThrow(/Unknown Locale/);
  });
});

// Test basic numbers from locale config (0-99, 100, 1000, etc.)
describe('Test Basic Numbers from Locale Config', () => {
  const locale = new ${varName}();
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
  
  const basicTests: [string, number][] = Array.from(wordToEntry.values())
    .map((entry) => [entry.value, entry.number] as [string, number]);
  
  test.concurrent.each(basicTests)('basic: "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

// Test data: [words, expected number]
const testIntegers: [string, number][] = [
${formatTestArray(testIntegers)}
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
`;

  // Skip uppercase tests for locales with special casing rules
  // Turkish/Azerbaijani: "i" → "İ" (dotted capital I), "ı" → "I" (dotless capital I)
  // German: "ß" → "SS" when uppercased
  const specialCasingLocales = ['tr-TR', 'az-AZ', 'de-DE'];
  if (!specialCasingLocales.includes(localeCode)) {
    output += `
describe('Test Case Insensitivity - Uppercase', () => {
  test.concurrent.each(testIntegers)('convert uppercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toUpperCase())).toBe(expected);
  });
});
`;
  }

  output += `
describe('Test Negative Integers with options = {}', () => {
  const locale = new ${varName}();
  const minusWord = locale.config.texts.minus;

  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.forEach((row, i) => {
    if (i === 0 || row[1] === 0) {
      return;
    }
    row[0] = \`\${minusWord} \${row[0]}\`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Integers - Lowercase', () => {
  const locale = new ${varName}();
  const minusWord = locale.config.texts.minus;

  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.forEach((row, i) => {
    if (i === 0 || row[1] === 0) {
      return;
    }
    row[0] = \`\${minusWord} \${row[0]}\`.toLowerCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
`;

  // Skip uppercase negative integer tests for locales with special casing rules
  if (!specialCasingLocales.includes(localeCode)) {
    output += `
describe('Test Negative Integers - Uppercase', () => {
  const locale = new ${varName}();
  const minusWord = locale.config.texts.minus;

  const testNegativeIntegers: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegers.forEach((row, i) => {
    if (i === 0 || row[1] === 0) {
      return;
    }
    row[0] = \`\${minusWord} \${row[0]}\`.toUpperCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegers.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
`;
  }

  output += `
describe('Test Integers with options = { currency: true }', () => {
  const locale = new ${varName}();
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';
  
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? \` \${currUnit} \${onlyWord}\` : \` \${currUnit}\`;
    row[0] = \`\${row[0]}\${suffix}\`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Integers with options = { currency: true, doNotAddOnly: true }', () => {
  const locale = new ${varName}();
  const currency = locale.config.currency;
  
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    row[0] = \`\${row[0]} \${currUnit}\`;
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true }', () => {
  const locale = new ${varName}();
  const minusWord = locale.config.texts.minus;
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';
  
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.forEach((row, i) => {
    const currUnit = row[1] === 1 || row[1] === -1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? \` \${currUnit} \${onlyWord}\` : \` \${currUnit}\`;
    if (i === 0 || row[1] === 0) {
      row[0] = \`\${row[0]}\${suffix}\`;
      return;
    }
    row[0] = \`\${minusWord} \${row[0]}\${suffix}\`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Negative Integers with options = { currency: true, doNotAddOnly: true }', () => {
  const locale = new ${varName}();
  const minusWord = locale.config.texts.minus;
  const currency = locale.config.currency;
  
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.forEach((row, i) => {
    const currUnit = row[1] === 1 || row[1] === -1 ? currency.singular : currency.plural;
    if (i === 0 || row[1] === 0) {
      row[0] = \`\${row[0]} \${currUnit}\`;
      return;
    }
    row[0] = \`\${minusWord} \${row[0]} \${currUnit}\`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});

describe('Test Currency - Lowercase', () => {
  const locale = new ${varName}();
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';
  
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? \` \${currUnit} \${onlyWord}\` : \` \${currUnit}\`;
    row[0] = \`\${row[0]}\${suffix}\`.toLowerCase();
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
`;

  // Skip uppercase currency tests for locales with special casing rules
  if (!specialCasingLocales.includes(localeCode)) {
    output += `
describe('Test Currency - Uppercase', () => {
  const locale = new ${varName}();
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';
  
  const testIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testIntegersWithCurrency.forEach((row) => {
    const currUnit = row[1] === 1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? \` \${currUnit} \${onlyWord}\` : \` \${currUnit}\`;
    row[0] = \`\${row[0]}\${suffix}\`.toUpperCase();
  });

  test.concurrent.each(testIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
`;
  }

  output += `
describe('Test Negative Currency - Lowercase', () => {
  const locale = new ${varName}();
  const minusWord = locale.config.texts.minus;
  const currency = locale.config.currency;
  const onlyWord = locale.config.texts.only || '';
  
  const testNegativeIntegersWithCurrency: [string, number][] = cloneDeep(testIntegers);
  testNegativeIntegersWithCurrency.forEach((row, i) => {
    const currUnit = row[1] === 1 || row[1] === -1 ? currency.singular : currency.plural;
    const suffix = onlyWord ? \` \${currUnit} \${onlyWord}\` : \` \${currUnit}\`;
    if (i === 0 || row[1] === 0) {
      row[0] = \`\${row[0]}\${suffix}\`.toLowerCase();
      return;
    }
    row[0] = \`\${minusWord} \${row[0]}\${suffix}\`.toLowerCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeIntegersWithCurrency)('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input, { currency: true })).toBe(expected);
  });
});
`;

  // Add float tests if we have float data
  // Skip float tests for locales that use ordinal-based decimal expressions (fa-IR, tr-TR)
  // These require ordinal parsing which is not yet implemented
  const ordinalDecimalLocales = ['fa-IR', 'tr-TR'];
  if (testFloats.length > 0 && !ordinalDecimalLocales.includes(localeCode)) {
    output += `
const testFloats: [string, number][] = [
${formatTestArray(testFloats)}
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
`;

    // Skip uppercase float tests for locales with special casing rules
    if (!specialCasingLocales.includes(localeCode)) {
      output += `
describe('Test Floats - Uppercase', () => {
  test.concurrent.each(testFloats)('convert uppercase "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input.toUpperCase())).toBe(expected);
  });
});
`;
    }

    output += `
describe('Test Negative Floats', () => {
  const locale = new ${varName}();
  const minusWord = locale.config.texts.minus;
  
  const testNegativeFloats: [string, number][] = cloneDeep(testFloats);
  testNegativeFloats.forEach((row, i) => {
    if (i === 0 || row[1] === 0) return;
    row[0] = \`\${minusWord} \${row[0]}\`;
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeFloats.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});

describe('Test Negative Floats - Lowercase', () => {
  const locale = new ${varName}();
  const minusWord = locale.config.texts.minus;
  
  const testNegativeFloats: [string, number][] = cloneDeep(testFloats);
  testNegativeFloats.forEach((row, i) => {
    if (i === 0 || row[1] === 0) return;
    row[0] = \`\${minusWord} \${row[0]}\`.toLowerCase();
    row[1] = -row[1];
  });

  test.concurrent.each(testNegativeFloats.filter((_, i) => i > 0))('convert "%s" => %d', (input, expected) => {
    expect(toNumbers.convert(input)).toBe(expected);
  });
});
`;
  }

  // NOTE: floatsWithCurrency and ordinals tests are skipped for now
  // These require features not yet implemented in to-numbers:
  // - floatsWithCurrency: requires parsing "<amount> <currency> And <cents> <fractional>" format
  // - ordinals: requires parsing "First", "Second", "Hundredth", etc.
  // TODO: Implement ordinal parsing and re-enable these tests

  return output;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const regenerateAll = args.includes('--all');
  const specificLocale = args.find((a) => !a.startsWith('--'));

  let localesToProcess: string[];

  if (specificLocale) {
    localesToProcess = [specificLocale];
  } else if (regenerateAll) {
    localesToProcess = getAllLocales();
  } else {
    // Only generate missing tests
    const allLocales = getAllLocales();
    const existingTests = fs
      .readdirSync(OUTPUT_DIR)
      .filter((f) => f.endsWith('.test.ts') && f !== 'ToNumbers.test.ts')
      .map((f) => f.replace('.test.ts', ''));
    localesToProcess = allLocales.filter((l) => !existingTests.includes(l));
  }

  console.log(`Processing ${localesToProcess.length} locales...`);

  let generated = 0;
  let skipped = 0;

  for (const localeCode of localesToProcess) {
    const data = extractTestData(localeCode);
    if (!data || data.integers.length === 0) {
      console.warn(`Skipping ${localeCode}: no test data found`);
      skipped++;
      continue;
    }

    const content = generateTestFile(localeCode, data);
    const outputPath = path.join(OUTPUT_DIR, `${localeCode}.test.ts`);
    fs.writeFileSync(outputPath, content);
    console.log(
      `Generated: ${localeCode}.test.ts (${data.integers.length} int, ${data.floats.length} float, ${data.floatsWithCurrency.length} floatCurr, ${data.ordinals.length} ord)`,
    );
    generated++;
  }

  console.log(`\nDone! Generated ${generated} test files, skipped ${skipped}.`);
}

main();
