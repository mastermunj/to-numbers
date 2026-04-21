import { type ConverterOptions, type LocaleConfig, type LocaleInterface, type ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: 'රුපියල',
      plural: 'රුපියල',
      singular: 'රුපියල',
      symbol: 'රු',
      fractionalUnit: {
        name: 'සත',
        singular: 'සත',
        plural: 'සත',
        symbol: '',
      },
    },
    texts: {
      and: 'සහ',
      minus: 'ඍණ',
      only: '',
      point: 'දශම',
    },
    numberWordsMapping: [
      { number: 1000000000000, value: 'ට්‍රිලියනය' },
      { number: 1000000000, value: 'බිලියනය' },
      { number: 1000000, value: 'මිලියනය' },
      { number: 100000, value: 'ලක්ෂය' },
      { number: 1000, value: 'දාහ' },
      { number: 100, value: 'සිය' },
      { number: 90, value: 'අනූ' },
      { number: 80, value: 'අසූ' },
      { number: 70, value: 'හැත්තෑ' },
      { number: 60, value: 'හැට' },
      { number: 50, value: 'පනස' },
      { number: 40, value: 'හතළිස' },
      { number: 30, value: 'තිස' },
      { number: 20, value: 'විස' },
      { number: 10, value: 'දහය' },
      { number: 9, value: 'නවය' },
      { number: 8, value: 'අට' },
      { number: 7, value: 'හත' },
      { number: 6, value: 'හය' },
      { number: 5, value: 'පහ' },
      { number: 4, value: 'හතර' },
      { number: 3, value: 'තුන' },
      { number: 2, value: 'දෙ' },
      { number: 1, value: 'එක' },
      { number: 0, value: 'ශූන්‍ය' },
    ],
    ignoreOneForWords: ['සිය', 'දාහ', 'ලක්ෂය'],
    exactWordsMapping: [
      { number: 12, value: 'දොළොස' },
      { number: 11, value: 'එකොළොස' },
    ],
    ordinalSuffix: 'වැනි',
    ordinalExactWordsMapping: [
      { number: 1, value: 'පළමු' },
      { number: 2, value: 'දෙවෙනි' },
      { number: 3, value: 'තෙවෙනි' },
    ],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need si-LK locale.
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
