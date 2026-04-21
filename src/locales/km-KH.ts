import { type ConverterOptions, type LocaleConfig, type LocaleInterface, type ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: 'រៀល',
      plural: 'រៀល',
      singular: 'រៀល',
      symbol: '៛',
      fractionalUnit: {
        name: 'សេន',
        plural: 'សេន',
        singular: 'សេន',
        symbol: '',
      },
    },
    texts: {
      and: '',
      minus: 'ដក',
      only: '',
      point: 'ចុច',
    },
    trim: true,
    ordinalPrefix: 'ទី',
    numberWordsMapping: [
      { number: 1000000000000, value: 'ទ្រីលាន' },
      { number: 1000000000, value: 'ប៊ីលាន' },
      { number: 1000000, value: 'លាន' },
      { number: 100000, value: 'សែន' },
      { number: 10000, value: 'មុឺន' },
      { number: 1000, value: 'ពាន់' },
      { number: 100, value: 'រយ' },
      { number: 90, value: 'កៅសិប' },
      { number: 80, value: 'ប៉ែតសិប' },
      { number: 70, value: 'ចិតសិប' },
      { number: 60, value: 'ហុកសិប' },
      { number: 50, value: 'ហាសិប' },
      { number: 40, value: 'សែសិប' },
      { number: 30, value: 'សាមសិប' },
      { number: 20, value: 'ម្ភៃ' },
      { number: 19, value: 'ដប់ប្រាំបួន' },
      { number: 18, value: 'ដប់ប្រាំបី' },
      { number: 17, value: 'ដប់ប្រាំពីរ' },
      { number: 16, value: 'ដប់ប្រាំមួយ' },
      { number: 15, value: 'ដប់ប្រាំ' },
      { number: 14, value: 'ដប់បួន' },
      { number: 13, value: 'ដប់បី' },
      { number: 12, value: 'ដប់ពីរ' },
      { number: 11, value: 'ដប់មួយ' },
      { number: 10, value: 'ដប់' },
      { number: 9, value: 'ប្រាំបួន' },
      { number: 8, value: 'ប្រាំបី' },
      { number: 7, value: 'ប្រាំពីរ' },
      { number: 6, value: 'ប្រាំមួយ' },
      { number: 5, value: 'ប្រាំ' },
      { number: 4, value: 'បួន' },
      { number: 3, value: 'បី' },
      { number: 2, value: 'ពីរ' },
      { number: 1, value: 'មួយ' },
      { number: 0, value: 'សូន្យ' },
    ],
    exactWordsMapping: [{ number: 100, value: 'មួយរយ' }],
  };
}

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
