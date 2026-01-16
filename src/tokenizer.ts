/**
 * Tokenizer utility for parsing word-based number strings
 */

export interface TokenizerOptions {
  /**
   * Whether matching is case-sensitive
   */
  caseSensitive: boolean;

  /**
   * Whether to trim concatenated words (e.g., Korean)
   */
  trim: boolean;

  /**
   * Word map to check if hyphenated words should be kept together
   */
  wordMap?: Map<string, number>;
}

const DEFAULT_OPTIONS: TokenizerOptions = {
  caseSensitive: false,
  trim: false,
};

/**
 * Normalize a word for consistent matching
 */
export function normalizeWord(word: string, caseSensitive: boolean = false): string {
  let normalized = word.trim();
  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  return normalized;
}

/**
 * Tokenize a string of words into individual tokens
 * Handles various separators: spaces, hyphens, commas, and special cases
 * Also handles multi-word phrases from the word map
 */
export function tokenize(input: string, options: Partial<TokenizerOptions> = {}): string[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!input || typeof input !== 'string') {
    return [];
  }

  let text = input.trim();

  if (!opts.caseSensitive) {
    text = text.toLowerCase();
  }

  // If we have a word map, try to match multi-word phrases first
  if (opts.wordMap) {
    return tokenizeWithPhrases(text, opts.wordMap, opts.caseSensitive);
  }

  // Fallback: simple tokenization by splitting on whitespace and hyphens
  const tokens = text
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .flatMap((token) => {
      // Check if token contains hyphens
      if (token.includes('-')) {
        // Split hyphenated words but keep the parts
        return token.split('-').filter((part) => part.length > 0);
      }
      return [token];
    });

  return tokens;
}

/**
 * Tokenize with support for multi-word phrases from word map
 */
function tokenizeWithPhrases(text: string, wordMap: Map<string, number>, caseSensitive: boolean = false): string[] {
  // Get all phrases from the map, sorted by word count (most words first), then by length
  const phrases = Array.from(wordMap.keys()).sort((a, b) => {
    const wordsA = a.split(/\s+/).length;
    const wordsB = b.split(/\s+/).length;
    if (wordsB !== wordsA) return wordsB - wordsA;
    return b.length - a.length;
  });

  const tokens: string[] = [];
  let remaining = text;

  while (remaining.trim().length > 0) {
    remaining = remaining.trim();
    let matched = false;

    // Try to match longest phrase first
    for (const phrase of phrases) {
      const normalizedPhrase = caseSensitive ? phrase : phrase.toLowerCase();
      if (remaining.startsWith(normalizedPhrase)) {
        // Check that the match ends at a word boundary
        const nextCharIndex = normalizedPhrase.length;
        if (nextCharIndex >= remaining.length || /\s/.test(remaining[nextCharIndex])) {
          tokens.push(normalizedPhrase);
          remaining = remaining.slice(normalizedPhrase.length);
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      // No phrase match, take the first word
      const spaceIndex = remaining.indexOf(' ');
      let word: string;
      if (spaceIndex === -1) {
        word = remaining;
        remaining = '';
      } else {
        word = remaining.slice(0, spaceIndex);
        remaining = remaining.slice(spaceIndex + 1);
      }

      // Handle hyphens in the word
      if (word.includes('-')) {
        if (wordMap.has(word)) {
          tokens.push(word);
        } else {
          tokens.push(...word.split('-').filter((part) => part.length > 0));
        }
      } else if (word.length > 0) {
        tokens.push(word);
      }
    }
  }

  return tokens;
}

/**
 * Clean and normalize input string
 */
export function cleanInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return (
    input
      .trim()
      // Normalize multiple spaces to single space
      .replace(/\s+/g, ' ')
      // Remove common punctuation that might appear in currency
      .replace(/[.,](?=\s|$)/g, '')
  );
}

/**
 * Check if a token is a number word in the given map
 */
export function isNumberWord(token: string, wordMap: Map<string, number>): boolean {
  return wordMap.has(token);
}

/**
 * Tokenize a concatenated string (no spaces) using longest-match algorithm
 * Used for languages like Korean where words are joined together
 */
export function tokenizeConcatenated(
  input: string,
  wordMap: Map<string, number>,
  caseSensitive: boolean = false,
  additionalWords: string[] = [],
): string[] {
  if (!input || typeof input !== 'string') {
    return [];
  }

  let text = input.trim();
  if (!caseSensitive) {
    text = text.toLowerCase();
  }

  // Combine word map keys with additional special words
  const allWords = [...Array.from(wordMap.keys()), ...additionalWords];
  // Sort by length (longest first) to ensure greedy matching
  const words = allWords.sort((a, b) => b.length - a.length);

  const tokens: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let matched = false;

    // Try to match the longest word at the start of remaining
    for (const word of words) {
      if (remaining.startsWith(word)) {
        tokens.push(word);
        remaining = remaining.slice(word.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // No match found, skip one character (could be whitespace or unknown)
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

/**
 * Get all variations of a word (for fuzzy matching in the future)
 */
export function getWordVariations(word: string): string[] {
  const variations: string[] = [word];

  // Add lowercase version
  const lower = word.toLowerCase();
  if (lower !== word) {
    variations.push(lower);
  }

  // Add version without common endings (for plural handling)
  if (word.endsWith('s') && word.length > 2) {
    variations.push(word.slice(0, -1));
  }

  return variations;
}
