import { type ConverterOptions, type LocaleConfig, type LocaleInterface, type ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

// Javanese (ngoko register) number words
// Uses Latin script (dominant writing system for modern Javanese)
// value[0] = counting/prefix form (used in quotient position, e.g. "Rong Atus" = 200)
// value[1] = standalone form (used in final/trailing position, e.g. "Loro" = 2)
// Ordinals use the "Kaping" prefix, with irregular first form "Kapisan".
export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: 'Rupiah',
      plural: 'Rupiah',
      singular: 'Rupiah',
      symbol: 'Rp',
      fractionalUnit: {
        name: 'Sen',
        plural: 'Sen',
        singular: 'Sen',
        symbol: '',
      },
    },
    texts: {
      and: 'Lan',
      minus: 'Minus',
      only: 'Waé',
      point: 'Koma',
    },
    useTrailingForCurrency: true,
    numberWordsMapping: [
      { number: 1000000000000000, value: 'Kuadriliun' },
      { number: 1000000000000, value: 'Triliun' },
      { number: 1000000000, value: 'Milyar' },
      { number: 1000000, value: 'Yuta', singularValue: 'Sayuta' },
      { number: 1000, value: 'Èwu', singularValue: 'Sèwu' },
      { number: 100, value: 'Atus', singularValue: 'Satus' },
      { number: 90, value: 'Sangang Puluh' },
      { number: 80, value: 'Wolung Puluh' },
      { number: 70, value: 'Pitung Puluh' },
      { number: 60, value: 'Sewidak' },
      { number: 50, value: 'Sèket' },
      { number: 40, value: 'Patang Puluh' },
      { number: 30, value: 'Telung Puluh' },
      { number: 29, value: 'Sangang Likur' },
      { number: 28, value: 'Wolung Likur' },
      { number: 27, value: 'Pitung Likur' },
      { number: 26, value: 'Nem Likur' },
      { number: 25, value: 'Selawé' },
      { number: 24, value: 'Pat Likur' },
      { number: 23, value: 'Telu Likur' },
      { number: 22, value: 'Rong Likur' },
      { number: 21, value: 'Selikur' },
      { number: 20, value: 'Rong Puluh' },
      { number: 19, value: 'Sangalas' },
      { number: 18, value: 'Wolulas' },
      { number: 17, value: 'Pitulas' },
      { number: 16, value: 'Nembelas' },
      { number: 15, value: 'Limalas' },
      { number: 14, value: 'Patbelas' },
      { number: 13, value: 'Telulas' },
      { number: 12, value: 'Rolas' },
      { number: 11, value: 'Sewelas' },
      { number: 10, value: 'Sepuluh' },
      { number: 9, value: ['Sangang', 'Sanga'] },
      { number: 8, value: ['Wolung', 'Wolu'] },
      { number: 7, value: ['Pitung', 'Pitu'] },
      { number: 6, value: ['Nem', 'Enem'] },
      { number: 5, value: ['Limang', 'Lima'] },
      { number: 4, value: ['Patang', 'Papat'] },
      { number: 3, value: ['Telung', 'Telu'] },
      { number: 2, value: ['Rong', 'Loro'] },
      { number: 1, value: 'Siji' },
      { number: 0, value: 'Nol' },
    ],
    exactWordsMapping: [
      { number: 1000, value: 'Sèwu' },
      { number: 100, value: 'Satus' },
    ],
    ordinalExactWordsMapping: [{ number: 1, value: 'Kapisan' }],
    ordinalPrefix: 'Kaping',
    ignoreOneForWords: ['Atus', 'Èwu', 'Yuta', 'Milyar', 'Triliun', 'Kuadriliun'],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need jv-ID locale.
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
