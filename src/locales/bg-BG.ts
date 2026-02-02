import { LocaleConfig, LocaleInterface, ToNumbersOptions } from '../types.js';
import { ToNumbersCore } from '../ToNumbersCore.js';

export default class Locale implements LocaleInterface {
  public config: LocaleConfig = {
    currency: {
      name: 'Лев',
      plural: 'Лева',
      singular: 'Лев',
      symbol: 'лв',
      fractionalUnit: {
        name: 'Стотинка',
        singular: 'Стотинка',
        plural: 'Стотинки',
        symbol: 'ст.',
      },
    },
    texts: {
      and: 'И',
      minus: 'Минус',
      only: 'Само',
      point: 'Цяло',
    },
    numberWordsMapping: [
      { number: 1000000000000000, value: 'Квадрилион' },
      { number: 1000000000000, value: 'Трилион' },
      { number: 1000000000, value: 'Милиард' },
      { number: 1000000, value: 'Милион' },
      { number: 1000, value: 'Хиляда', singularValue: 'Хиляда' },
      { number: 900, value: 'Деветстотин' },
      { number: 800, value: 'Осемстотин' },
      { number: 700, value: 'Седемстотин' },
      { number: 600, value: 'Шестстотин' },
      { number: 500, value: 'Петстотин' },
      { number: 400, value: 'Четиристотин' },
      { number: 300, value: 'Триста' },
      { number: 200, value: 'Двеста' },
      { number: 100, value: 'Сто' },
      { number: 90, value: 'Деветдесет' },
      { number: 80, value: 'Осемдесет' },
      { number: 70, value: 'Седемдесет' },
      { number: 60, value: 'Шестдесет' },
      { number: 50, value: 'Петдесет' },
      { number: 40, value: 'Четиридесет' },
      { number: 30, value: 'Тридесет' },
      { number: 20, value: 'Двадесет' },
      { number: 19, value: 'Деветнадесет' },
      { number: 18, value: 'Осемнадесет' },
      { number: 17, value: 'Седемнадесет' },
      { number: 16, value: 'Шестнадесет' },
      { number: 15, value: 'Петнадесет' },
      { number: 14, value: 'Четиринадесет' },
      { number: 13, value: 'Тринадесет' },
      { number: 12, value: 'Дванадесет' },
      { number: 11, value: 'Единадесет' },
      { number: 10, value: 'Десет' },
      { number: 9, value: 'Девет' },
      { number: 8, value: 'Осем' },
      { number: 7, value: 'Седем' },
      { number: 6, value: 'Шест' },
      { number: 5, value: 'Пет' },
      { number: 4, value: 'Четири' },
      { number: 3, value: 'Три' },
      { number: 2, value: 'Две' },
      { number: 1, value: 'Едно' },
      { number: 0, value: 'Нула' },
    ],
    exactWordsMapping: [{ number: 100, value: 'Сто' }],
    pluralForms: {
      1000: {
        paucal: 'Хиляди',
        plural: 'Хиляди',
      },
      1000000: {
        paucal: 'Милиона',
        plural: 'Милиона',
      },
      1000000000: {
        paucal: 'Милиарда',
        plural: 'Милиарда',
      },
      1000000000000: {
        paucal: 'Трилиона',
        plural: 'Трилиона',
      },
      1000000000000000: {
        paucal: 'Квадрилиона',
        plural: 'Квадрилиона',
      },
    },
    paucalConfig: {
      min: 2,
      max: 4,
    },
    ignoreOneForWords: [
      'Сто',
      'Двеста',
      'Триста',
      'Четиристотин',
      'Петстотин',
      'Шестстотин',
      'Седемстотин',
      'Осемстотин',
      'Деветстотин',
      'Хиляда',
      'Милион',
      'Милиард',
      'Трилион',
      'Квадрилион',
    ],
  };
}

/**
 * Per-locale ToNumbers class for tree-shaking.
 * Use this when you only need bg-BG locale.
 */
export class ToNumbers extends ToNumbersCore {
  constructor(options: ToNumbersOptions = {}) {
    super(options);
    this.setLocale(Locale);
  }
}
