import { type ConverterOptions, type LocaleConfig, type LocaleInterface, type ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: "So'm",
      plural: "So'm",
      singular: "So'm",
      symbol: 'UZS',
      fractionalUnit: {
        name: 'Tiyin',
        singular: 'Tiyin',
        plural: 'Tiyin',
        symbol: '',
      },
    },
    texts: {
      and: 'Va',
      minus: 'Minus',
      only: '',
      point: 'Vergul',
    },
    numberWordsMapping: [
      { number: 1000000000000, value: 'Trillion' },
      { number: 1000000000, value: 'Milliard' },
      { number: 1000000, value: 'Million' },
      { number: 1000, value: 'Ming' },
      { number: 100, value: 'Yuz' },
      { number: 90, value: "To'qson" },
      { number: 80, value: 'Sakson' },
      { number: 70, value: 'Yetmish' },
      { number: 60, value: 'Oltmish' },
      { number: 50, value: 'Ellik' },
      { number: 40, value: 'Qirq' },
      { number: 30, value: "O'ttiz" },
      { number: 20, value: 'Yigirma' },
      { number: 10, value: "O'n" },
      { number: 9, value: "To'qqiz" },
      { number: 8, value: 'Sakkiz' },
      { number: 7, value: 'Yetti' },
      { number: 6, value: 'Olti' },
      { number: 5, value: 'Besh' },
      { number: 4, value: "To'rt" },
      { number: 3, value: 'Uch' },
      { number: 2, value: 'Ikki' },
      { number: 1, value: 'Bir' },
      { number: 0, value: 'Nol' },
    ],
    ignoreOneForWords: ['Yuz', 'Ming'],
    ordinalSuffix: 'inchi',
    ordinalWordsMapping: [
      { number: 1000000000, value: 'Milliardinchi' },
      { number: 1000000, value: 'Millioninchi' },
      { number: 1000, value: 'Minginchi' },
      { number: 100, value: 'Yuzinchi' },
      { number: 90, value: "To'qsoninchi" },
      { number: 80, value: 'Saksoninchi' },
      { number: 70, value: 'Yetmishinchi' },
      { number: 60, value: 'Oltmishinchi' },
      { number: 50, value: 'Ellikinchi' },
      { number: 40, value: 'Qirqinchi' },
      { number: 30, value: "O'ttizinchi" },
      { number: 20, value: 'Yigirmanchi' },
      { number: 17, value: "O'n Yettinchi" },
      { number: 16, value: "O'n Oltinchi" },
      { number: 12, value: "O'n Ikkinchi" },
      { number: 10, value: "O'ninchi" },
      { number: 9, value: "To'qqizinchi" },
      { number: 8, value: 'Sakkizinchi' },
      { number: 7, value: 'Yettinchi' },
      { number: 6, value: 'Oltinchi' },
      { number: 5, value: 'Beshinchi' },
      { number: 4, value: "To'rtinchi" },
      { number: 3, value: 'Uchinchi' },
      { number: 2, value: 'Ikkinchi' },
      { number: 1, value: 'Birinchi' },
      { number: 0, value: 'Nolinchi' },
    ],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need uz-UZ locale.
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
