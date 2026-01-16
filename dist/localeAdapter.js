"use strict";
/**
 * Locale Adapter - Builds parser locale config from original to-words locale
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWordToNumberMap = buildWordToNumberMap;
exports.extractScaleWords = extractScaleWords;
exports.buildCurrencyWords = buildCurrencyWords;
exports.buildParserLocaleConfig = buildParserLocaleConfig;
const tokenizer_1 = require("./tokenizer");
/**
 * Scale values that represent multipliers (hundred and above)
 */
const SCALE_VALUES = new Set([
    100, // Hundred
    1000, // Thousand
    10000, // Wan (Korean/Chinese)
    100000, // Lakh
    1000000, // Million
    10000000, // Crore
    100000000, // Yi (Korean)
    1000000000, // Billion
    1000000000000, // Trillion
    1000000000000000, // Quadrillion
]);
/**
 * Extract the word value from a NumberWordMap entry
 */
function extractWordValue(value) {
    if (Array.isArray(value)) {
        // Return both forms (e.g., trailing and non-trailing forms)
        return value.filter((v) => v.length > 0);
    }
    return [value];
}
/**
 * Build a reverse word-to-number mapping from the original locale config
 */
function buildWordToNumberMap(config, caseSensitive = false) {
    const wordToNumber = new Map();
    // Process numberWordsMapping
    for (const mapping of config.numberWordsMapping) {
        const words = extractWordValue(mapping.value);
        for (const word of words) {
            const normalized = (0, tokenizer_1.normalizeWord)(word, caseSensitive);
            // Handle multi-word values (e.g., "Twenty One")
            wordToNumber.set(normalized, mapping.number);
        }
        // Also add singularValue if present
        if (mapping.singularValue) {
            const normalized = (0, tokenizer_1.normalizeWord)(mapping.singularValue, caseSensitive);
            wordToNumber.set(normalized, mapping.number);
        }
    }
    // Process exactWordsMapping (special cases like "One Hundred")
    if (config.exactWordsMapping) {
        for (const mapping of config.exactWordsMapping) {
            const words = extractWordValue(mapping.value);
            for (const word of words) {
                const normalized = (0, tokenizer_1.normalizeWord)(word, caseSensitive);
                wordToNumber.set(normalized, mapping.number);
            }
        }
    }
    // Add plural mark variants if defined
    if (config.pluralMark && config.pluralWords) {
        for (const word of config.pluralWords) {
            const pluralForm = word + config.pluralMark;
            const baseNumber = wordToNumber.get((0, tokenizer_1.normalizeWord)(word, caseSensitive));
            if (baseNumber !== undefined) {
                wordToNumber.set((0, tokenizer_1.normalizeWord)(pluralForm, caseSensitive), baseNumber);
            }
        }
    }
    // Add pluralForms (dual, paucal, plural variants for Arabic and similar)
    if (config.pluralForms) {
        for (const [numberStr, forms] of Object.entries(config.pluralForms)) {
            const number = parseInt(numberStr, 10);
            const pluralForms = forms;
            // Dual form represents 2x the base number (e.g., ألفان = 2000)
            if (pluralForms.dual) {
                wordToNumber.set((0, tokenizer_1.normalizeWord)(pluralForms.dual, caseSensitive), number * 2);
            }
            // Paucal and plural are used with explicit numbers, so they map to the base
            if (pluralForms.paucal) {
                wordToNumber.set((0, tokenizer_1.normalizeWord)(pluralForms.paucal, caseSensitive), number);
            }
            if (pluralForms.plural) {
                wordToNumber.set((0, tokenizer_1.normalizeWord)(pluralForms.plural, caseSensitive), number);
            }
        }
    }
    return wordToNumber;
}
/**
 * Extract scale word values from the word-to-number map
 */
function extractScaleWords(wordToNumber) {
    const scaleWords = new Set();
    for (const [, number] of wordToNumber) {
        if (SCALE_VALUES.has(number)) {
            scaleWords.add(number);
        }
    }
    return scaleWords;
}
/**
 * Build currency word lists from locale config
 */
function buildCurrencyWords(config, caseSensitive = false) {
    const mainUnit = [];
    const fractionalUnit = [];
    const currency = config.currency;
    // Main currency unit words
    if (currency.name) {
        mainUnit.push((0, tokenizer_1.normalizeWord)(currency.name, caseSensitive));
    }
    if (currency.plural) {
        mainUnit.push((0, tokenizer_1.normalizeWord)(currency.plural, caseSensitive));
    }
    if (currency.singular) {
        mainUnit.push((0, tokenizer_1.normalizeWord)(currency.singular, caseSensitive));
    }
    // Fractional unit words
    const fractional = currency.fractionalUnit;
    if (fractional.name) {
        fractionalUnit.push((0, tokenizer_1.normalizeWord)(fractional.name, caseSensitive));
    }
    if (fractional.plural) {
        fractionalUnit.push((0, tokenizer_1.normalizeWord)(fractional.plural, caseSensitive));
    }
    if (fractional.singular) {
        fractionalUnit.push((0, tokenizer_1.normalizeWord)(fractional.singular, caseSensitive));
    }
    return { mainUnit, fractionalUnit };
}
/**
 * Build complete parser locale config from original to-words locale
 */
function buildParserLocaleConfig(config, caseSensitive = false) {
    var _a;
    const wordToNumber = buildWordToNumberMap(config, caseSensitive);
    const scaleWords = extractScaleWords(wordToNumber);
    const currencyWords = buildCurrencyWords(config, caseSensitive);
    // Build text marker arrays (normalized)
    const texts = {
        and: config.texts.and ? [(0, tokenizer_1.normalizeWord)(config.texts.and, caseSensitive)] : [],
        minus: config.texts.minus ? [(0, tokenizer_1.normalizeWord)(config.texts.minus, caseSensitive)] : [],
        point: config.texts.point ? [(0, tokenizer_1.normalizeWord)(config.texts.point, caseSensitive)] : [],
        only: config.texts.only ? [(0, tokenizer_1.normalizeWord)(config.texts.only, caseSensitive)] : [],
    };
    return {
        wordToNumber,
        scaleWords,
        texts,
        currency: currencyWords,
        caseSensitive,
        trim: (_a = config.trim) !== null && _a !== void 0 ? _a : false,
        splitWord: config.splitWord ? (0, tokenizer_1.normalizeWord)(config.splitWord, caseSensitive) : undefined,
    };
}
