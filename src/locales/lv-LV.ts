import { LocaleConfig, LocaleInterface, ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: 'eiro',
      plural: 'eiro',
      symbol: '€',
      fractionalUnit: {
        name: 'cents',
        plural: 'centi',
        symbol: '',
      },
    },
    texts: {
      and: 'un',
      minus: 'mīnus',
      only: '',
      point: 'komats',
    },
    numberWordsMapping: [
      { number: 1000000000000000, value: 'kvadriljon' },
      { number: 1000000000000, value: 'triljon' },
      { number: 1000000000, value: 'miljard' },
      { number: 1000000, value: 'miljoni', singularValue: 'miljons' },
      { number: 1000, value: 'tūkstoši', singularValue: 'tūkstotis' },
      { number: 900, value: 'deviņi simti' },
      { number: 800, value: 'astoņi simti' },
      { number: 700, value: 'septiņi simti' },
      { number: 600, value: 'seši simti' },
      { number: 500, value: 'pieci simti' },
      { number: 400, value: 'četri simti' },
      { number: 300, value: 'trīs simti' },
      { number: 200, value: 'divi simti' },
      { number: 100, value: 'simtu' },
      { number: 90, value: 'deviņdesmit' },
      { number: 80, value: 'astoņdesmit' },
      { number: 70, value: 'septiņdesmit' },
      { number: 60, value: 'sešdesmit' },
      { number: 50, value: 'piecdesmit' },
      { number: 40, value: 'četrdesmit' },
      { number: 30, value: 'trīsdesmit' },
      { number: 20, value: 'divdesmit' },
      { number: 19, value: 'deviņpadsmit' },
      { number: 18, value: 'astoņpadsmit' },
      { number: 17, value: 'septiņpadsmit' },
      { number: 16, value: 'sešpadsmit' },
      { number: 15, value: 'piecpadsmit' },
      { number: 14, value: 'četrdpadsmit' },
      { number: 13, value: 'trīspadsmit' },
      { number: 12, value: 'divpadsmit' },
      { number: 11, value: 'vienpadsmit' },
      { number: 10, value: 'desmit' },
      { number: 9, value: 'deviņi' },
      { number: 8, value: 'astoņi' },
      { number: 7, value: 'septiņi' },
      { number: 6, value: 'seši' },
      { number: 5, value: 'pieci' },
      { number: 4, value: 'četri' },
      { number: 3, value: 'trīs' },
      { number: 2, value: 'divi' },
      { number: 1, value: 'viens' },
      { number: 0, value: 'nulle' },
    ],
    ignoreOneForWords: [
      'simtu',
      'divi simti',
      'trīs simti',
      'četri simti',
      'pieci simti',
      'seši simti',
      'septiņi simti',
      'astoņi simti',
      'deviņi simti',
    ],
    exactWordsMapping: [{ number: 100, value: 'Simtu' }],
    pluralMark: 'i',
    pluralWords: ['kvadriljon', 'triljon', 'miljard'],
    ordinalWordsMapping: [
      { number: 1000000, value: 'Miljontais' },
      { number: 1000, value: 'Tūkstošais' },
      { number: 100, value: 'Simtais' },
      { number: 90, value: 'Deviņdesmitais' },
      { number: 80, value: 'Astoņdesmitais' },
      { number: 70, value: 'Septiņdesmitais' },
      { number: 60, value: 'Sešdesmitais' },
      { number: 50, value: 'Piecdesmitais' },
      { number: 40, value: 'Četrdesmitais' },
      { number: 30, value: 'Trīsdesmitais' },
      { number: 20, value: 'Divdesmitais' },
      { number: 19, value: 'Deviņpadsmitais' },
      { number: 18, value: 'Astoņpadsmitais' },
      { number: 17, value: 'Septiņpadsmitais' },
      { number: 16, value: 'Sešpadsmitais' },
      { number: 15, value: 'Piecpadsmitais' },
      { number: 14, value: 'Četrpadsmitais' },
      { number: 13, value: 'Trīspadsmitais' },
      { number: 12, value: 'Divpadsmitais' },
      { number: 11, value: 'Vienpadsmitais' },
      { number: 10, value: 'Desmitais' },
      { number: 9, value: 'Devītais' },
      { number: 8, value: 'Astotais' },
      { number: 7, value: 'Septītais' },
      { number: 6, value: 'Sestais' },
      { number: 5, value: 'Piektais' },
      { number: 4, value: 'Ceturtais' },
      { number: 3, value: 'Trešais' },
      { number: 2, value: 'Otrais' },
      { number: 1, value: 'Pirmais' },
    ],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need lv-LV locale.
 */
export class ToNumbers extends ToNumbersCore {
  constructor(options: ToNumbersOptions = {}) {
    super(options);
    this.setLocale(Locale);
  }
}
