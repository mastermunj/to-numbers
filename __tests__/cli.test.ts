import { afterEach, describe, expect, test, vi } from 'vitest';
import { runCli } from '../src/cli';

describe('CLI', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('prints help and exits 0 when no args are given', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    expect(runCli([])).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Usage: to-numbers'));
  });

  test('prints help and exits 0 for --help', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    expect(runCli(['--help'])).toBe(0);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('--words <text>'));
  });

  test('parses keyed input with explicit locale', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    expect(runCli(['--words', 'One Hundred Twenty Three', '--locale', 'en-US'])).toBe(0);
    expect(logSpy).toHaveBeenCalledWith('123');
  });

  test('parses positional input with explicit locale', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    expect(runCli(['One Hundred Twenty Three', '--locale', 'en-US'])).toBe(0);
    expect(logSpy).toHaveBeenCalledWith('123');
  });

  test('parses currency input', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    expect(runCli(['--words', 'One Hundred Dollars Only', '--locale', 'en-US', '--currency'])).toBe(0);
    expect(logSpy).toHaveBeenCalledWith('100');
  });

  test('returns 1 when --locale is missing a value', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(runCli(['--words', 'One Hundred', '--locale'])).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith('Error: --locale requires a locale code (for example: --locale en-US).');
  });

  test('returns 1 for unknown flags', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(runCli(['--words', 'One Hundred', '--wat'])).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith('Error: Unknown flag "--wat".');
  });

  test('returns 1 when both --words and positional input are provided', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(runCli(['--words', 'One Hundred', 'Two Hundred'])).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith('Error: Provide input using either --words or positional text, not both.');
  });
});
