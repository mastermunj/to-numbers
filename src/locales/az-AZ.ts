import { LocaleConfig, LocaleInterface, ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: 'Manat',
      plural: 'Manat',
      singular: 'Manat',
      symbol: '₼',
      fractionalUnit: {
        name: 'Qəpik',
        singular: 'Qəpik',
        plural: 'Qəpik',
        symbol: '',
      },
    },
    texts: {
      and: 'Və',
      minus: 'Mənfi',
      only: '',
      point: 'Nöqtə',
    },
    numberWordsMapping: [
      { number: 1000000000000000, value: 'Katrilyon' },
      { number: 1000000000000, value: 'Trilyon' },
      { number: 1000000000, value: 'Milyard' },
      { number: 1000000, value: 'Milyon' },
      { number: 1000, value: 'Min' },
      { number: 100, value: 'Yüz' },
      { number: 90, value: 'Doxsan' },
      { number: 80, value: 'Səksən' },
      { number: 70, value: 'Yetmiş' },
      { number: 60, value: 'Altmış' },
      { number: 50, value: 'Əlli' },
      { number: 40, value: 'Qırx' },
      { number: 30, value: 'Otuz' },
      { number: 20, value: 'İyirmi' },
      { number: 19, value: 'On Doqquz' },
      { number: 18, value: 'On Səkkiz' },
      { number: 17, value: 'On Yeddi' },
      { number: 16, value: 'On Altı' },
      { number: 15, value: 'On Beş' },
      { number: 14, value: 'On Dörd' },
      { number: 13, value: 'On Üç' },
      { number: 12, value: 'On İki' },
      { number: 11, value: 'On Bir' },
      { number: 10, value: 'On' },
      { number: 9, value: 'Doqquz' },
      { number: 8, value: 'Səkkiz' },
      { number: 7, value: 'Yeddi' },
      { number: 6, value: 'Altı' },
      { number: 5, value: 'Beş' },
      { number: 4, value: 'Dörd' },
      { number: 3, value: 'Üç' },
      { number: 2, value: 'İki' },
      { number: 1, value: 'Bir' },
      { number: 0, value: 'Sıfır' },
    ],
    ignoreOneForWords: ['Min'],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need az-AZ locale.
 */
export class ToNumbers extends ToNumbersCore {
  constructor(options: ToNumbersOptions = {}) {
    super(options);
    this.setLocale(Locale);
  }
}
