import { LocaleConfig, LocaleInterface, ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: 'Рубель',
      plural: 'Рублёў',
      singular: 'Рубель',
      symbol: 'Br',
      fractionalUnit: {
        name: 'Капейка',
        singular: 'Капейка',
        plural: 'Капеек',
        symbol: 'кап.',
      },
    },
    texts: {
      and: 'І',
      minus: 'Мінус',
      only: 'Толькі',
      point: 'Цэлых',
    },
    numberWordsMapping: [
      { number: 1000000000000000, value: 'Квадрыльён' },
      { number: 1000000000000, value: 'Трыльён' },
      { number: 1000000000, value: 'Мільярд' },
      { number: 1000000, value: 'Мільён' },
      { number: 1000, value: 'Тысяча', singularValue: 'Тысяча' },
      { number: 900, value: 'Дзевяцьсот' },
      { number: 800, value: 'Восемсот' },
      { number: 700, value: 'Семсот' },
      { number: 600, value: 'Шэсцьсот' },
      { number: 500, value: 'Пяцьсот' },
      { number: 400, value: 'Чатырыста' },
      { number: 300, value: 'Трыста' },
      { number: 200, value: 'Дзвесце' },
      { number: 100, value: 'Сто' },
      { number: 90, value: 'Дзевяноста' },
      { number: 80, value: 'Восемдзесят' },
      { number: 70, value: 'Семдзесят' },
      { number: 60, value: 'Шэсцьдзясят' },
      { number: 50, value: 'Пяцьдзясят' },
      { number: 40, value: 'Сорак' },
      { number: 30, value: 'Трыццаць' },
      { number: 20, value: 'Дваццаць' },
      { number: 19, value: 'Дзевятнаццаць' },
      { number: 18, value: 'Васямнаццаць' },
      { number: 17, value: 'Сямнаццаць' },
      { number: 16, value: 'Шаснаццаць' },
      { number: 15, value: 'Пятнаццаць' },
      { number: 14, value: 'Чатырнаццаць' },
      { number: 13, value: 'Трынаццаць' },
      { number: 12, value: 'Дванаццаць' },
      { number: 11, value: 'Адзінаццаць' },
      { number: 10, value: 'Дзесяць' },
      { number: 9, value: 'Дзевяць' },
      { number: 8, value: 'Восем' },
      { number: 7, value: 'Сем' },
      { number: 6, value: 'Шэсць' },
      { number: 5, value: 'Пяць' },
      { number: 4, value: 'Чатыры' },
      { number: 3, value: 'Тры' },
      { number: 2, value: 'Два' },
      { number: 1, value: 'Адзін' },
      { number: 0, value: 'Нуль' },
    ],
    exactWordsMapping: [{ number: 100, value: 'Сто' }],
    pluralForms: {
      1000: {
        paucal: 'Тысячы',
        plural: 'Тысяч',
      },
      1000000: {
        paucal: 'Мільёны',
        plural: 'Мільёнаў',
      },
      1000000000: {
        paucal: 'Мільярды',
        plural: 'Мільярдаў',
      },
      1000000000000: {
        paucal: 'Трыльёны',
        plural: 'Трыльёнаў',
      },
      1000000000000000: {
        paucal: 'Квадрыльёны',
        plural: 'Квадрыльёнаў',
      },
    },
    paucalConfig: {
      min: 2,
      max: 4,
    },
    ignoreOneForWords: [
      'Сто',
      'Дзвесце',
      'Трыста',
      'Чатырыста',
      'Пяцьсот',
      'Шэсцьсот',
      'Семсот',
      'Восемсот',
      'Дзевяцьсот',
      'Тысяча',
      'Мільён',
      'Мільярд',
      'Трыльён',
      'Квадрыльён',
    ],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need be-BY locale.
 */
export class ToNumbers extends ToNumbersCore {
  constructor(options: ToNumbersOptions = {}) {
    super(options);
    this.setLocale(Locale);
  }
}
