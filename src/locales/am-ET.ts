import { LocaleConfig, LocaleInterface, ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: 'ብር',
      plural: 'ብር',
      singular: 'ብር',
      symbol: 'ETB',
      fractionalUnit: {
        name: 'ሳንቲም',
        singular: 'ሳንቲም',
        plural: 'ሳንቲም',
        symbol: '',
      },
    },
    texts: {
      and: 'እና',
      minus: 'አሉታዊ',
      only: 'ብቻ',
      point: 'ነጥብ',
    },
    numberWordsMapping: [
      { number: 1000000000000000, value: 'ኳድሪሊዮን' },
      { number: 1000000000000, value: 'ትሪሊዮን' },
      { number: 1000000000, value: 'ቢሊዮን' },
      { number: 1000000, value: 'ሚሊዮን' },
      { number: 1000, value: 'ሺ' },
      { number: 100, value: 'መቶ' },
      { number: 90, value: 'ዘጠና' },
      { number: 80, value: 'ሰማንያ' },
      { number: 70, value: 'ሰባ' },
      { number: 60, value: 'ስድሳ' },
      { number: 50, value: 'ሃምሳ' },
      { number: 40, value: 'አርባ' },
      { number: 30, value: 'ሰላሳ' },
      { number: 20, value: 'ሃያ' },
      { number: 19, value: 'አስራ ዘጠኝ' },
      { number: 18, value: 'አስራ ስምንት' },
      { number: 17, value: 'አስራ ሰባት' },
      { number: 16, value: 'አስራ ስድስት' },
      { number: 15, value: 'አስራ አምስት' },
      { number: 14, value: 'አስራ አራት' },
      { number: 13, value: 'አስራ ሦስት' },
      { number: 12, value: 'አስራ ሁለት' },
      { number: 11, value: 'አስራ አንድ' },
      { number: 10, value: 'አስር' },
      { number: 9, value: 'ዘጠኝ' },
      { number: 8, value: 'ስምንት' },
      { number: 7, value: 'ሰባት' },
      { number: 6, value: 'ስድስት' },
      { number: 5, value: 'አምስት' },
      { number: 4, value: 'አራት' },
      { number: 3, value: 'ሦስት' },
      { number: 2, value: 'ሁለት' },
      { number: 1, value: 'አንድ' },
      { number: 0, value: 'ዜሮ' },
    ],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need am-ET locale.
 */
export class ToNumbers extends ToNumbersCore {
  constructor(options: ToNumbersOptions = {}) {
    super(options);
    this.setLocale(Locale);
  }
}
