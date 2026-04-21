import { type ConverterOptions, type LocaleConfig, type LocaleInterface, type ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: '元',
      plural: '元',
      singular: '元',
      symbol: 'HK$',
      fractionalUnit: {
        name: '仙',
        singular: '仙',
        plural: '仙',
        symbol: '',
      },
    },
    texts: {
      and: '',
      minus: '負',
      only: '整',
      point: '點',
    },
    numberWordsMapping: [
      { number: 100000000000000000000n, value: '垓' },
      { number: 10000000000000000000n, value: '千京' },
      { number: 1000000000000000000n, value: '百京' },
      { number: 100000000000000000n, value: '十京' },
      { number: 10000000000000000n, value: '京' },
      { number: 1000000000000000, value: '千兆' },
      { number: 100000000000000, value: '百兆' },
      { number: 10000000000000, value: '十兆' },
      { number: 1000000000000, value: '兆' },
      { number: 100000000000, value: '千億' },
      { number: 10000000000, value: '百億' },
      { number: 1000000000, value: '十億' },
      { number: 100000000, value: '億' },
      { number: 10000000, value: '千萬' },
      { number: 1000000, value: '百萬' },
      { number: 100000, value: '十萬' },
      { number: 10000, value: '萬' },
      { number: 1000, value: '千' },
      { number: 100, value: '百' },
      { number: 90, value: '九十' },
      { number: 80, value: '八十' },
      { number: 70, value: '七十' },
      { number: 60, value: '六十' },
      { number: 50, value: '五十' },
      { number: 40, value: '四十' },
      { number: 30, value: '三十' },
      { number: 20, value: '二十' },
      { number: 10, value: '十' },
      { number: 9, value: '九' },
      { number: 8, value: '八' },
      { number: 7, value: '七' },
      { number: 6, value: '六' },
      { number: 5, value: '五' },
      { number: 4, value: '四' },
      { number: 3, value: '三' },
      { number: 2, value: '二' },
      { number: 1, value: '一' },
      { number: 0, value: '零' },
    ],
    ignoreOneForWords: [
      '十',
      '百',
      '千',
      '萬',
      '十萬',
      '百萬',
      '千萬',
      '億',
      '十億',
      '百億',
      '千億',
      '兆',
      '十兆',
      '百兆',
      '千兆',
    ],
    trim: true,
    ordinalWordsMapping: [
      { number: 100, value: '第百' },
      { number: 90, value: '第九十' },
      { number: 80, value: '第八十' },
      { number: 70, value: '第七十' },
      { number: 60, value: '第六十' },
      { number: 50, value: '第五十' },
      { number: 40, value: '第四十' },
      { number: 30, value: '第三十' },
      { number: 20, value: '第二十' },
      { number: 10, value: '第十' },
      { number: 9, value: '第九' },
      { number: 8, value: '第八' },
      { number: 7, value: '第七' },
      { number: 6, value: '第六' },
      { number: 5, value: '第五' },
      { number: 4, value: '第四' },
      { number: 3, value: '第三' },
      { number: 2, value: '第二' },
      { number: 1, value: '第一' },
      { number: 0, value: '第零' },
    ],
    ordinalExactWordsMapping: [
      { number: 1, value: '第一' },
      { number: 2, value: '第二' },
      { number: 3, value: '第三' },
      { number: 4, value: '第四' },
      { number: 5, value: '第五' },
      { number: 6, value: '第六' },
      { number: 7, value: '第七' },
      { number: 8, value: '第八' },
      { number: 9, value: '第九' },
      { number: 10, value: '第十' },
      { number: 20, value: '第二十' },
      { number: 30, value: '第三十' },
      { number: 40, value: '第四十' },
      { number: 50, value: '第五十' },
      { number: 60, value: '第六十' },
      { number: 70, value: '第七十' },
      { number: 80, value: '第八十' },
      { number: 90, value: '第九十' },
      { number: 100, value: '第百' },
    ],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need yue-HK locale.
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
