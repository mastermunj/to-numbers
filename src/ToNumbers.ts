/**
 * ToNumbers - Full-featured class with all bundled locales.
 *
 * This class extends ToNumbersCore and adds locale lookup by code string.
 * It imports all locales, so use this when you need dynamic locale switching
 * or don't care about bundle size.
 *
 * For tree-shaken single-locale imports, use per-locale entry points instead:
 *
 * @example
 * // Full package (all locales)
 * import { ToNumbers } from 'to-numbers';
 * const tn = new ToNumbers({ localeCode: 'en-IN' });
 *
 * // Single locale (smaller bundle) - SAME API!
 * import { ToNumbers } from 'to-numbers/en-IN';
 * const tn = new ToNumbers();
 */

import { ConstructorOf, LocaleInterface } from './types.js';
import { ToNumbersCore, DefaultConverterOptions, DefaultToNumbersOptions } from './ToNumbersCore.js';
import LOCALES from './locales/index.js';

// Re-export everything from ToNumbersCore for backwards compatibility
export { DefaultConverterOptions, DefaultToNumbersOptions };
export { LOCALES };

export class ToNumbers extends ToNumbersCore {
  /**
   * Get the locale class for the current locale code.
   * Overrides ToNumbersCore to add locale lookup by string.
   */
  public getLocaleClass(): ConstructorOf<LocaleInterface> {
    // If locale was set directly via setLocale(), use that
    if (this.localeClass !== undefined) {
      return this.localeClass;
    }

    // Otherwise, look up by locale code
    const localeCode = this.options.localeCode!;
    if (!(localeCode in LOCALES)) {
      throw new Error(`Unknown Locale "${localeCode}"`);
    }
    return LOCALES[localeCode];
  }
}
