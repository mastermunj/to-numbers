import { LocaleConfig, LocaleInterface, ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: '원',
      plural: '원',
      symbol: '',
      fractionalUnit: {
        name: '',
        plural: '',
        symbol: '',
      },
    },
    texts: {
      and: '하고 ',
      minus: '마이너스',
      only: '',
      point: '점',
    },
    trim: true,
    numberWordsMapping: [
      { number: 1000000000000, value: '조' },
      { number: 100000000, value: '억' },
      { number: 10000, value: '만' },
      { number: 1000, value: '천' },
      { number: 100, value: '백' },
      { number: 90, value: '구십' },
      { number: 80, value: '팔십' },
      { number: 70, value: '칠십' },
      { number: 60, value: '육십' },
      { number: 50, value: '오십' },
      { number: 40, value: '사십' },
      { number: 30, value: '삼십' },
      { number: 20, value: '이십' },
      { number: 19, value: '십구' },
      { number: 18, value: '십팔' },
      { number: 17, value: '십칠' },
      { number: 16, value: '십육' },
      { number: 15, value: '십오' },
      { number: 14, value: '십사' },
      { number: 13, value: '십삼' },
      { number: 12, value: '십이' },
      { number: 11, value: '십일' },
      { number: 10, value: '십' },
      { number: 9, value: '구' },
      { number: 8, value: '팔' },
      { number: 7, value: '칠' },
      { number: 6, value: '육' },
      { number: 5, value: '오' },
      { number: 4, value: '사' },
      { number: 3, value: '삼' },
      { number: 2, value: '이' },
      { number: 1, value: '일' },
      { number: 0, value: '영' },
    ],
    ordinalSuffix: '번째',
    ordinalWordsMapping: [
      { number: 100, value: '백번째' },
      { number: 90, value: '구십번째' },
      { number: 80, value: '팔십번째' },
      { number: 70, value: '칠십번째' },
      { number: 60, value: '육십번째' },
      { number: 50, value: '오십번째' },
      { number: 40, value: '사십번째' },
      { number: 30, value: '삼십번째' },
      { number: 20, value: '이십번째' },
      { number: 10, value: '열번째' },
      { number: 9, value: '아홉번째' },
      { number: 8, value: '여덟번째' },
      { number: 7, value: '일곱번째' },
      { number: 6, value: '여섯번째' },
      { number: 5, value: '다섯번째' },
      { number: 4, value: '네번째' },
      { number: 3, value: '세번째' },
      { number: 2, value: '두번째' },
      { number: 1, value: '첫번째' },
    ],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need ko-KR locale.
 */
export class ToNumbers extends ToNumbersCore {
  constructor(options: ToNumbersOptions = {}) {
    super(options);
    this.setLocale(Locale);
  }
}
