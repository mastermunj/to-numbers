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

  /**
   * Pre-sorted phrases for performance (optional - if not provided, will sort on demand)
   */
  sortedPhrases?: string[];
}

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
  // Avoid object spread - use options directly with defaults
  const caseSensitive = options.caseSensitive ?? false;

  if (!input || typeof input !== 'string') {
    return [];
  }

  let text = input.trim();

  if (!caseSensitive) {
    text = text.toLowerCase();
  }

  // If we have a word map, try to match multi-word phrases first
  if (options.wordMap) {
    return tokenizeWithPhrases(text, options.wordMap, options.sortedPhrases);
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
 * Optimized: avoids creating substrings, uses direct character checks
 */
function tokenizeWithPhrases(text: string, wordMap: Map<string, number>, sortedPhrases?: string[]): string[] {
  const tokens: string[] = [];
  let pos = 0;
  const len = text.length;
  const hasMultiWordPhrases = sortedPhrases && sortedPhrases.length > 0;

  while (pos < len) {
    // Skip leading whitespace using char code checks (faster than regex)
    let c = text.charCodeAt(pos);
    while (pos < len && (c === 32 || c === 9 || c === 10 || c === 13)) {
      pos++;
      if (pos < len) c = text.charCodeAt(pos);
    }
    if (pos >= len) break;

    let matched = false;

    // Try multi-word phrase matching first if we have multi-word phrases
    if (hasMultiWordPhrases) {
      for (const phrase of sortedPhrases!) {
        const phraseLen = phrase.length;
        // Quick check: can the phrase fit?
        if (pos + phraseLen > len) continue;

        // Check if text at position matches the phrase
        let matches = true;
        for (let i = 0; i < phraseLen; i++) {
          if (text.charCodeAt(pos + i) !== phrase.charCodeAt(i)) {
            matches = false;
            break;
          }
        }

        if (matches) {
          // Check that the match ends at a word boundary
          const nextPos = pos + phraseLen;
          if (nextPos >= len) {
            tokens.push(phrase);
            pos = nextPos;
            matched = true;
            break;
          }
          const nextChar = text.charCodeAt(nextPos);
          if (nextChar === 32 || nextChar === 9 || nextChar === 10 || nextChar === 13) {
            tokens.push(phrase);
            pos = nextPos;
            matched = true;
            break;
          }
        }
      }
    }

    if (matched) continue;

    // Find the end of the current word using char codes
    let wordEnd = pos;
    while (wordEnd < len) {
      const cc = text.charCodeAt(wordEnd);
      if (cc === 32 || cc === 9 || cc === 10 || cc === 13) break;
      wordEnd++;
    }

    const word = text.slice(pos, wordEnd);

    // Check if this single word is in the map
    if (wordMap.has(word)) {
      tokens.push(word);
      pos = wordEnd;
      continue;
    }

    // Handle hyphens in the word
    if (word.includes('-')) {
      const parts = word.split('-');
      for (const part of parts) {
        if (part.length > 0) {
          tokens.push(part);
        }
      }
      pos = wordEnd;
      continue;
    }

    // No match found, just add the word as-is
    if (word.length > 0) {
      tokens.push(word);
    }
    pos = wordEnd;
  }

  return tokens;
}

// Pre-compiled regexes for cleanInput (avoid creating new regex objects on every call)
const MULTI_SPACE_REGEX = /\s+/g;
const TRAILING_PUNCT_REGEX = /[.,](?=\s|$)/g;

/**
 * Clean and normalize input string
 * Optimized: avoids regex for common cases
 */
export function cleanInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const trimmed = input.trim();

  // Fast path: check if we need any cleaning at all
  // Most inputs don't have multiple spaces or trailing punctuation
  let needsCleaning = false;
  let prevWasSpace = false;
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed.charCodeAt(i);
    // Check for multiple spaces
    if (c === 32) {
      if (prevWasSpace) {
        needsCleaning = true;
        break;
      }
      prevWasSpace = true;
    } else {
      prevWasSpace = false;
      // Check for trailing punctuation (. or , followed by space or end)
      if (c === 46 || c === 44) {
        // period or comma
        if (i === trimmed.length - 1 || trimmed.charCodeAt(i + 1) === 32) {
          needsCleaning = true;
          break;
        }
      }
    }
  }

  if (!needsCleaning) {
    return trimmed;
  }

  // Slow path: use regex for cleaning
  return trimmed.replace(MULTI_SPACE_REGEX, ' ').replace(TRAILING_PUNCT_REGEX, '');
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
 * @param sortedWords Pre-sorted words array (optional - if provided, skips sorting for performance)
 */
export function tokenizeConcatenated(
  input: string,
  wordMap: Map<string, number>,
  caseSensitive: boolean = false,
  additionalWords: string[] = [],
  sortedWords?: string[],
): string[] {
  if (!input || typeof input !== 'string') {
    return [];
  }

  let text = input.trim();
  if (!caseSensitive) {
    text = text.toLowerCase();
  }

  // Use pre-sorted words if provided, otherwise compute on demand
  let words: string[];
  if (sortedWords) {
    words = sortedWords;
  } else {
    // Combine word map keys with additional special words
    const allWords = [...Array.from(wordMap.keys()), ...additionalWords];
    // Sort by length (longest first) to ensure greedy matching
    words = allWords.sort((a, b) => b.length - a.length);
  }

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
