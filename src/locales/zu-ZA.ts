import { type ConverterOptions, type LocaleConfig, type LocaleInterface, type ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: 'Rand',
      plural: 'Rand',
      singular: 'Rand',
      symbol: 'R',
      fractionalUnit: {
        name: 'Senti',
        singular: 'Senti',
        plural: 'Senti',
        symbol: 'c',
      },
    },
    texts: {
      and: 'Na',
      minus: 'Minus',
      only: '',
      point: 'Iphoyinti',
    },
    numberWordsMapping: [
      { number: 1000000000000, value: 'Ithriliyoni' },
      { number: 1000000000, value: 'Ibhiliyoni' },
      { number: 1000000, value: 'Isigidi' },
      { number: 1000, value: 'Inkulungwane' },
      { number: 100, value: 'Ikhulu' },
      { number: 90, value: 'Amashumi Ayisishiyagalolunye' },
      { number: 80, value: 'Amashumi Ayisishiyagalombili' },
      { number: 70, value: 'Amashumi Ayisikhombisa' },
      { number: 60, value: 'Amashumi Ayisithupha' },
      { number: 50, value: 'Amashumi Amahlanu' },
      { number: 40, value: 'Amashumi Amane' },
      { number: 30, value: 'Amashumi Amathathu' },
      { number: 20, value: 'Amashumi Amabili' },
      { number: 19, value: 'Ishumi Nesishiyagalolunye' },
      { number: 18, value: 'Ishumi Nesishiyagalombili' },
      { number: 17, value: 'Ishumi Nesikhombisa' },
      { number: 16, value: 'Ishumi Nesithupha' },
      { number: 15, value: 'Ishumi Nanhlanu' },
      { number: 14, value: 'Ishumi Nane' },
      { number: 13, value: 'Ishumi Nantathu' },
      { number: 12, value: 'Ishumi Nambili' },
      { number: 11, value: 'Ishumi Nanye' },
      { number: 10, value: 'Ishumi' },
      { number: 9, value: 'Isishiyagalolunye' },
      { number: 8, value: 'Isishiyagalombili' },
      { number: 7, value: 'Isikhombisa' },
      { number: 6, value: 'Isithupha' },
      { number: 5, value: 'Kuhlanu' },
      { number: 4, value: 'Kune' },
      { number: 3, value: 'Kuthathu' },
      { number: 2, value: 'Kubili' },
      { number: 1, value: 'Kunye' },
      { number: 0, value: 'Iqanda' },
    ],
    ignoreOneForWords: ['Ikhulu', 'Inkulungwane', 'Isigidi'],
    splitWord: 'Na',
    ordinalSuffix: 'okwesikhathi',
    ordinalWordsMapping: [
      { number: 1000, value: 'Kwenkulungwane' },
      { number: 100, value: 'Kwekhulu' },
      { number: 90, value: 'Kwamashumi Ayisishiyagalolunye' },
      { number: 80, value: 'Kwamashumi Ayisishiyagalombili' },
      { number: 70, value: 'Kwamashumi Ayisikhombisa' },
      { number: 60, value: 'Kwamashumi Ayisithupha' },
      { number: 50, value: 'Kwamashumi Amahlanu' },
      { number: 40, value: 'Kwamashumi Amane' },
      { number: 30, value: 'Kwamashumi Amathathu' },
      { number: 20, value: 'Kwamashumi Amabili' },
      { number: 19, value: 'Kweshumi Nesishiyagalolunye' },
      { number: 18, value: 'Kweshumi Nesishiyagalombili' },
      { number: 17, value: 'Kweshumi Nesikhombisa' },
      { number: 16, value: 'Kweshumi Nesithupha' },
      { number: 15, value: 'Kweshumi Nanhlanu' },
      { number: 14, value: 'Kweshumi Nane' },
      { number: 13, value: 'Kweshumi Nantathu' },
      { number: 12, value: 'Kweshumi Nambili' },
      { number: 11, value: 'Kweshumi Nanye' },
      { number: 10, value: 'Kweshumi' },
      { number: 9, value: 'Kwesishiyagalolunye' },
      { number: 8, value: 'Kwesishiyagalombili' },
      { number: 7, value: 'Kwesikhombisa' },
      { number: 6, value: 'Kwesithupha' },
      { number: 5, value: 'Kwehlanu' },
      { number: 4, value: 'Kwane' },
      { number: 3, value: 'Kwathathu' },
      { number: 2, value: 'Kwesibili' },
      { number: 1, value: 'Kwokuqala' },
      { number: 0, value: 'Kweqanda' },
    ],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need zu-ZA locale.
 */
export class ToNumbers extends ToNumbersCore {
  constructor(options: ToNumbersOptions = {}) {
    super(options);
    this.setLocale(Locale);
  }
}

const instance = new ToNumbers();

export function toNumbers(words: string, options?: ConverterOptions): number {
  return instance.convert(words, options);
}
