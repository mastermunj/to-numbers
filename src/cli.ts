#!/usr/bin/env node

import path from 'node:path';
import { toNumbers } from './ToNumbers.js';

function printHelp(): void {
  console.log(`Usage: to-numbers --words <text> [options]

Options:
  --words <text>     Words to parse into a number
  --locale <code>    Locale code (default: en-IN)
  --currency         Parse as currency amount
  -h, --help         Show this help

Examples:
  to-numbers --words "One Hundred Twenty Three" --locale en-US
  to-numbers --words "One Hundred Dollars Only" --locale en-US --currency
  to-numbers "One Hundred Twenty Three" --locale en-US
`);
}

export function runCli(args: string[] = process.argv.slice(2)): number {
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    return 0;
  }

  let wordsFromFlag: string | undefined;
  let localeCode: string | undefined;
  let isCurrency = false;
  const positionalWords: string[] = [];

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (arg === '--currency') {
      isCurrency = true;
      continue;
    }

    if (arg === '--locale') {
      const providedLocale = args[index + 1];
      if (!providedLocale || providedLocale.startsWith('-')) {
        console.error('Error: --locale requires a locale code (for example: --locale en-US).');
        return 1;
      }
      localeCode = providedLocale;
      index++;
      continue;
    }

    if (arg === '--words') {
      const providedWords = args[index + 1];
      if (!providedWords || providedWords.startsWith('-')) {
        console.error('Error: --words requires text to parse.');
        return 1;
      }
      wordsFromFlag = providedWords;
      index++;
      continue;
    }

    if (arg.startsWith('-')) {
      console.error(`Error: Unknown flag "${arg}".`);
      return 1;
    }

    positionalWords.push(arg);
  }

  if (wordsFromFlag && positionalWords.length > 0) {
    console.error('Error: Provide input using either --words or positional text, not both.');
    return 1;
  }

  const words = wordsFromFlag ?? positionalWords.join(' ');
  if (!words) {
    console.error('Error: No words provided to parse.');
    return 1;
  }

  const result = toNumbers(words, {
    localeCode,
    currency: isCurrency,
  });
  console.log(String(result));
  return 0;
}

function isExecutedDirectly(): boolean {
  if (!process.argv[1]) {
    return false;
  }

  const executableName = path.basename(process.argv[1]);
  return executableName === 'cli.js' || executableName === 'cli.ts';
}

if (isExecutedDirectly()) {
  process.exit(runCli());
}
