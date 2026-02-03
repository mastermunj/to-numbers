# to-numbers

[![npm version](https://img.shields.io/npm/v/to-numbers.svg)](https://www.npmjs.com/package/to-numbers)
[![npm downloads](https://img.shields.io/npm/dm/to-numbers.svg)](https://www.npmjs.com/package/to-numbers)
[![build](https://img.shields.io/github/actions/workflow/status/mastermunj/to-numbers/ci.yml?branch=main&label=build)](https://github.com/mastermunj/to-numbers/actions)
[![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/mastermunj/to-numbers)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/to-numbers?label=minzipped)](https://bundlephobia.com/package/to-numbers)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/to-numbers)](https://github.com/mastermunj/to-numbers/blob/main/LICENSE)

Convert words to numbers with comprehensive locale, currency, and decimal support. The reverse of the [`to-words`](https://www.npmjs.com/package/to-words) package. Ideal for parsing written amounts in invoicing, voice input, e-commerce, and financial applications.

## 📑 Table of Contents

- [Use Cases](#-use-cases)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [Framework Integration](#%EF%B8%8F-framework-integration)
- [Numbering Systems](#-numbering-systems)
- [API Reference](#%EF%B8%8F-api-reference)
- [Bundle Sizes](#-bundle-sizes)
- [Browser Compatibility](#-browser-compatibility)
- [Supported Locales](#%EF%B8%8F-supported-locales)
- [Error Handling](#%EF%B8%8F-error-handling)
- [Contributing](#-contributing)
- [FAQ](#-faq)
- [Changelog](#-changelog)
- [License](#-license)

## 💼 Use Cases

- **Financial Applications** — Parse amount-in-words from invoices, cheques, and financial documents
- **Voice/Speech Input** — Convert spoken numbers from speech-to-text to numeric values
- **Data Processing** — Extract numeric data from textual documents and forms
- **OCR Post-Processing** — Parse numbers recognized from scanned documents
- **Chatbots & NLP** — Understand numeric inputs in natural language
- **Accessibility** — Support users who input numbers as words
- **Localization** — Parse numbers in 94 different languages and regions

## ✨ Features

- **94 Locales** — The most comprehensive locale coverage available
- **Reverse of to-words** — Perfectly complements the to-words package
- **Multiple Numbering Systems** — Short scale, Long scale, Indian, and East Asian
- **Currency Parsing** — Parse locale-specific currency with fractional units
- **Ordinal Numbers** — Parse ordinals like "First", "Twenty Third", "Hundredth"
- **Decimal Numbers** — Handle "Point" notation and fractional units
- **Case Insensitive** — Works with any case combination
- **Tree-Shakeable** — Import only the locales you need
- **TypeScript Native** — Full type definitions included
- **Multiple Formats** — ESM, CommonJS, and UMD browser bundles
- **Zero Dependencies** — Lightweight and self-contained

## 🚀 Quick Start

```js
import { ToNumbers } from 'to-numbers';

const toNumbers = new ToNumbers();
toNumbers.convert('Twelve Thousand Three Hundred Forty Five');
// 12345
```

## 📦 Installation

### npm / yarn / pnpm

```bash
npm install to-numbers
# or
yarn add to-numbers
# or
pnpm add to-numbers
```

### CDN (Browser)

```html
<!-- Full bundle with all locales -->
<script src="https://cdn.jsdelivr.net/npm/to-numbers/dist/umd/to-numbers.min.js"></script>

<!-- Single locale bundle (smaller, recommended) -->
<script src="https://cdn.jsdelivr.net/npm/to-numbers/dist/umd/en-US.min.js"></script>
```

## 📖 Usage

### Importing

```js
// ESM
import { ToNumbers } from 'to-numbers';

// CommonJS
const { ToNumbers } = require('to-numbers');
```

### Basic Conversion

```js
const toNumbers = new ToNumbers({ localeCode: 'en-US' });

toNumbers.convert('One Hundred Twenty Three');
// 123

toNumbers.convert('One Hundred Twenty Three Point Four Five');
// 123.45

toNumbers.convert('Minus Fifty');
// -50
```

### Case Insensitivity

```js
const toNumbers = new ToNumbers({ localeCode: 'en-US' });

toNumbers.convert('one hundred twenty three');
// 123

toNumbers.convert('ONE HUNDRED TWENTY THREE');
// 123

toNumbers.convert('One Hundred Twenty Three');
// 123
```

### Ordinal Numbers

Parse ordinal words automatically — no special options needed:

```js
const toNumbers = new ToNumbers({ localeCode: 'en-US' });

toNumbers.convert('First');
// 1

toNumbers.convert('Twenty Third');
// 23

toNumbers.convert('One Hundredth');
// 100

toNumbers.convert('One Thousand Two Hundred Thirty Fourth');
// 1234
```

### Currency Parsing

```js
const toNumbers = new ToNumbers({ localeCode: 'en-IN' });

toNumbers.convert('Four Hundred Fifty Two Rupees Only', { currency: true });
// 452

toNumbers.convert('Four Hundred Fifty Two Rupees And Thirty Six Paise Only', { currency: true });
// 452.36

// Works without "Only" suffix too
toNumbers.convert('Four Hundred Fifty Two Rupees', { currency: true });
// 452

// Fractional units only
toNumbers.convert('Thirty Six Paise Only', { currency: true });
// 0.36
```

### Custom Currency

Override currency settings while keeping the locale's language:

```js
const toNumbers = new ToNumbers({
  localeCode: 'en-US',
  converterOptions: {
    currency: true,
    currencyOptions: {
      name: 'Euro',
      plural: 'Euros',
      symbol: '€',
      fractionalUnit: {
        name: 'Cent',
        plural: 'Cents',
        symbol: '',
      },
    },
  },
});

toNumbers.convert('One Hundred Euros And Fifty Cents Only');
// 100.50
```

### Tree-Shakeable Imports

Import only the locales you need for smaller bundle sizes:

```js
// Import specific locale directly (includes ToNumbers configured for that locale)
import { ToNumbers } from 'to-numbers/en-US';

const toNumbers = new ToNumbers();
toNumbers.convert('Twelve Thousand Three Hundred Forty Five');
// 12345
```

### Browser Usage (UMD)

```html
<!-- Single locale (recommended, smaller bundle) -->
<script src="https://cdn.jsdelivr.net/npm/to-numbers/dist/umd/en-US.min.js"></script>
<script>
  // ToNumbers is pre-configured for en-US
  const toNumbers = new ToNumbers();
  console.log(toNumbers.convert('Twelve Thousand'));
  // 12000
</script>

<!-- Full bundle with all locales -->
<script src="https://cdn.jsdelivr.net/npm/to-numbers/dist/umd/to-numbers.min.js"></script>
<script>
  // Specify locale when using full bundle
  const toNumbers = new ToNumbers({ localeCode: 'fr-FR' });
  console.log(toNumbers.convert('Douze Mille'));
  // 12000
</script>
```

## ⚛️ Framework Integration

### React

```tsx
import { ToNumbers } from 'to-numbers/en-US';

const toNumbers = new ToNumbers();

function ParsedAmount({ text }: { text: string }) {
  const amount = toNumbers.convert(text, { currency: true });
  return <span className="amount">${amount.toFixed(2)}</span>;
}

// Usage: <ParsedAmount text="One Thousand Two Hundred Thirty Four Dollars" />
// Renders: $1234.00
```

### Vue 3

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { ToNumbers } from 'to-numbers/en-US';

const props = defineProps<{ text: string }>();
const toNumbers = new ToNumbers();

const amount = computed(() =>
  toNumbers.convert(props.text, { currency: true })
);
</script>

<template>
  <span class="amount">${{ amount.toFixed(2) }}</span>
</template>
```

### Angular

```typescript
import { Pipe, PipeTransform } from '@angular/core';
import { ToNumbers } from 'to-numbers/en-US';

@Pipe({ name: 'toNumbers', standalone: true })
export class ToNumbersPipe implements PipeTransform {
  private toNumbers = new ToNumbers();

  transform(value: string, currency = false): number {
    return this.toNumbers.convert(value, { currency });
  }
}

// Usage: {{ 'One Thousand Dollars' | toNumbers:true }}
```

### Svelte

```svelte
<script lang="ts">
  import { ToNumbers } from 'to-numbers/en-US';
  
  export let text: string;
  
  const toNumbers = new ToNumbers();
  $: amount = toNumbers.convert(text, { currency: true });
</script>

<span class="amount">${amount.toFixed(2)}</span>
```

## 🌍 Numbering Systems

Different regions use different numbering systems. This library supports all major systems:

### Short Scale (Western)

Used in: USA, UK, Canada, Australia, and most English-speaking countries.

| Number | Name |
|--------|------|
| 10^6 | Million |
| 10^9 | Billion |
| 10^12 | Trillion |
| 10^15 | Quadrillion |

```js
const toNumbers = new ToNumbers({ localeCode: 'en-US' });
toNumbers.convert('One Quintillion');
// 1000000000000000000
```

### Long Scale (European)

Used in: Germany, France, and many European countries.

| Number | German | French |
|--------|--------|--------|
| 10^6 | Million | Million |
| 10^9 | Milliarde | Milliard |
| 10^12 | Billion | Billion |

```js
const toNumbers = new ToNumbers({ localeCode: 'de-DE' });
toNumbers.convert('Eins Milliarde');
// 1000000000
```

### Indian System

Used in: India, Bangladesh, Nepal, Pakistan.

| Number | Name |
|--------|------|
| 10^5 | Lakh |
| 10^7 | Crore |
| 10^9 | Arab |
| 10^11 | Kharab |
| 10^13 | Neel |
| 10^15 | Padma |
| 10^17 | Shankh |

```js
const toNumbers = new ToNumbers({ localeCode: 'en-IN' });
toNumbers.convert('Five Lakh Twenty Three Thousand');
// 523000

toNumbers.convert('Two Crore Fifty Lakh');
// 25000000

const toNumbersHindi = new ToNumbers({ localeCode: 'hi-IN' });
toNumbersHindi.convert('एक करोड़');
// 10000000
```

### East Asian System

Used in: Japan, China, Korea.

| Number | Character |
|--------|-----------|
| 10^4 | 万 (Man/Wan) |
| 10^8 | 億 (Oku/Yi) |
| 10^12 | 兆 (Chō/Zhao) |

```js
const toNumbers = new ToNumbers({ localeCode: 'ko-KR' });
toNumbers.convert('일억');
// 100000000
```

## ⚙️ API Reference

### Constructor Options

```typescript
interface ToNumbersOptions {
  localeCode?: string;           // Default: 'en-IN'
  converterOptions?: {
    currency?: boolean;          // Default: false (auto-detect when undefined)
    currencyOptions?: {          // Override locale's currency settings
      name: string;
      plural: string;
      symbol: string;
      fractionalUnit: {
        name: string;
        plural: string;
        symbol: string;
      };
    };
  };
}
```

### Methods

#### `convert(text, options?)`

Converts words to a number.

- **text**: `string` — The text containing number words to convert
- **options**: `ConverterOptions` — Override instance options
- **returns**: `number` — The parsed numeric value

```js
const toNumbers = new ToNumbers({ localeCode: 'en-US' });

toNumbers.convert('One Hundred Twenty Three');
// 123

toNumbers.convert('Fifty Dollars Only', { currency: true });
// 50
```

### Converter Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `currency` | boolean | false | Parse as currency with locale-specific formatting |
| `currencyOptions` | object | undefined | Override locale's default currency settings |

## 📏 Bundle Sizes

| Import Method | Raw | Gzip |
|--------------|-----|------|
| Full bundle (all 94 locales) | ~500 KB | ~50 KB |
| Single locale (en-US) | ~10 KB | ~3 KB |
| Single locale (en-IN) | ~9 KB | ~3 KB |

> **Tip:** Use tree-shakeable imports or single-locale UMD bundles for the smallest bundle size.

## 🌐 Browser Compatibility

| Browser | Version |
|---------|--------|
| Chrome | 49+ |
| Firefox | 52+ |
| Safari | 10+ |
| Edge | 14+ |
| Opera | 36+ |

## 🗺️ Supported Locales

All 94 locales with their features:

| Locale | Language | Country | Currency | Scale |
|--------|----------|---------|----------|-------|
| af-ZA | Afrikaans | South Africa | Rand | Short |
| am-ET | Amharic | Ethiopia | ብር | Short |
| ar-AE | Arabic | UAE | درهم | Short |
| ar-LB | Arabic | Lebanon | ليرة | Short |
| ar-MA | Arabic | Morocco | درهم | Short |
| ar-SA | Arabic | Saudi Arabia | ريال | Short |
| az-AZ | Azerbaijani | Azerbaijan | Manat | Short |
| be-BY | Belarusian | Belarus | Рубель | Short |
| bg-BG | Bulgarian | Bulgaria | Лев | Short |
| bn-IN | Bengali | India | টাকা | Indian |
| ca-ES | Catalan | Spain | Euro | Short |
| cs-CZ | Czech | Czech Republic | Koruna | Short |
| da-DK | Danish | Denmark | Krone | Long |
| de-DE | German | Germany | Euro | Long |
| ee-EE | Estonian | Estonia | Euro | Short |
| el-GR | Greek | Greece | Ευρώ | Short |
| en-AE | English | UAE | Dirham | Short |
| en-AU | English | Australia | Dollar | Short |
| en-BD | English | Bangladesh | Taka | Indian |
| en-CA | English | Canada | Dollar | Short |
| en-GB | English | United Kingdom | Pound | Short |
| en-GH | English | Ghana | Cedi | Short |
| en-IE | English | Ireland | Euro | Short |
| en-IN | English | India | Rupee | Indian |
| en-KE | English | Kenya | Shilling | Short |
| en-MA | English | Morocco | Dirham | Short |
| en-MM | English | Myanmar | Kyat | Short |
| en-MU | English | Mauritius | Rupee | Indian |
| en-MY | English | Malaysia | Ringgit | Short |
| en-NG | English | Nigeria | Naira | Short |
| en-NP | English | Nepal | Rupee | Indian |
| en-NZ | English | New Zealand | Dollar | Short |
| en-OM | English | Oman | Rial | Short |
| en-PH | English | Philippines | Peso | Short |
| en-PK | English | Pakistan | Rupee | Indian |
| en-SA | English | Saudi Arabia | Riyal | Short |
| en-SG | English | Singapore | Dollar | Short |
| en-US | English | USA | Dollar | Short |
| en-ZA | English | South Africa | Rand | Short |
| es-AR | Spanish | Argentina | Peso | Short |
| es-ES | Spanish | Spain | Euro | Short |
| es-MX | Spanish | Mexico | Peso | Short |
| es-US | Spanish | USA | Dólar | Short |
| es-VE | Spanish | Venezuela | Bolívar | Short |
| fa-IR | Persian | Iran | تومان | Short |
| fi-FI | Finnish | Finland | Euro | Short |
| fil-PH | Filipino | Philippines | Piso | Short |
| fr-BE | French | Belgium | Euro | Long |
| fr-FR | French | France | Euro | Long |
| fr-MA | French | Morocco | Dirham | Long |
| fr-SA | French | Saudi Arabia | Riyal | Long |
| gu-IN | Gujarati | India | રૂપિયો | Indian |
| ha-NG | Hausa | Nigeria | Naira | Short |
| hbo-IL | Biblical Hebrew | Israel | שקל | Short |
| he-IL | Hebrew | Israel | שקל | Short |
| hi-IN | Hindi | India | रुपया | Indian |
| hr-HR | Croatian | Croatia | Euro | Short |
| hu-HU | Hungarian | Hungary | Forint | Short |
| id-ID | Indonesian | Indonesia | Rupiah | Short |
| is-IS | Icelandic | Iceland | Króna | Short |
| it-IT | Italian | Italy | Euro | Short |
| ja-JP | Japanese | Japan | 円 | East Asian |
| ka-GE | Georgian | Georgia | ლარი | Short |
| kn-IN | Kannada | India | ರೂಪಾಯಿ | Indian |
| ko-KR | Korean | South Korea | 원 | Short |
| lt-LT | Lithuanian | Lithuania | Euras | Short |
| lv-LV | Latvian | Latvia | Eiro | Short |
| mr-IN | Marathi | India | रुपया | Indian |
| ms-MY | Malay | Malaysia | Ringgit | Short |
| nb-NO | Norwegian | Norway | Krone | Long |
| nl-NL | Dutch | Netherlands | Euro | Short |
| nl-SR | Dutch | Suriname | Dollar | Short |
| np-NP | Nepali | Nepal | रुपैयाँ | Indian |
| pa-IN | Punjabi | India | ਰੁਪਇਆ | Indian |
| pl-PL | Polish | Poland | Złoty | Short |
| pt-BR | Portuguese | Brazil | Real | Short |
| pt-PT | Portuguese | Portugal | Euro | Short |
| ro-RO | Romanian | Romania | Leu | Short |
| ru-RU | Russian | Russia | Рубль | Short |
| sk-SK | Slovak | Slovakia | Euro | Short |
| sl-SI | Slovenian | Slovenia | Euro | Short |
| sq-AL | Albanian | Albania | Lek | Short |
| sr-RS | Serbian | Serbia | Dinar | Short |
| sv-SE | Swedish | Sweden | Krona | Short |
| sw-KE | Swahili | Kenya | Shilingi | Short |
| ta-IN | Tamil | India | ரூபாய் | Indian |
| te-IN | Telugu | India | రూపాయి | Indian |
| th-TH | Thai | Thailand | บาท | Short |
| tr-TR | Turkish | Turkey | Lira | Short |
| uk-UA | Ukrainian | Ukraine | Гривня | Short |
| ur-PK | Urdu | Pakistan | روپیہ | Indian |
| vi-VN | Vietnamese | Vietnam | Đồng | Short |
| yo-NG | Yoruba | Nigeria | Naira | Short |
| zh-CN | Chinese | China | 元 | East Asian |

**Scale Legend:**
- **Short** — Western short scale (Million, Billion, Trillion...)
- **Long** — European long scale (Million, Milliard, Billion, Billiard...)
- **Indian** — Indian numbering (Lakh, Crore, Arab, Kharab...)
- **East Asian** — East Asian numbering (万, 億, 兆, 京...)

## ⚠️ Error Handling

The library throws descriptive errors for invalid inputs:

### Invalid Input

```js
const toNumbers = new ToNumbers();

toNumbers.convert('');
// Error: Invalid Input ""

toNumbers.convert('   ');
// Error: Invalid Input "   "
```

### Unknown Locale

```js
const toNumbers = new ToNumbers({ localeCode: 'xx-XX' });
toNumbers.convert('One');
// Error: Unknown Locale "xx-XX"
```

### Handling Errors

```js
try {
  const amount = toNumbers.convert(userInput, { currency: true });
  console.log('Parsed amount:', amount);
} catch (error) {
  console.error('Parsing failed:', error.message);
}
```

## 🤝 Contributing

### Adding a New Locale

1. **Create the locale file**: Add `src/locales/<locale-code>.ts` implementing `LocaleInterface` from `src/types.ts`. Use an existing locale as a template.

2. **Register the locale**: Import your class in `src/locales/index.ts` and add it to the `LOCALES` map.

3. **Add tests**: Create `__tests__/<locale-code>.test.ts` covering integers, negatives, decimals, and currency parsing.

4. **Update documentation**: Add the locale to the Supported Locales section above.

5. **Build and test**: Run `npm test` and `npm run build`, then submit your PR.

## ❓ FAQ

<details>
<summary><strong>How does this relate to the to-words package?</strong></summary>

`to-numbers` is the reverse of `to-words`. While `to-words` converts `123` → `"One Hundred Twenty Three"`, `to-numbers` converts `"One Hundred Twenty Three"` → `123`.

They share the same locale support and are designed to work together:

```js
import { ToWords } from 'to-words';
import { ToNumbers } from 'to-numbers';

const toWords = new ToWords({ localeCode: 'en-US' });
const toNumbers = new ToNumbers({ localeCode: 'en-US' });

const words = toWords.convert(12345);
// "Twelve Thousand Three Hundred Forty Five"

const number = toNumbers.convert(words);
// 12345 ✓ Round-trip complete!
```

</details>

<details>
<summary><strong>Is parsing case-sensitive?</strong></summary>

No! The parser is fully case-insensitive:

```js
toNumbers.convert('one hundred');      // 100
toNumbers.convert('ONE HUNDRED');      // 100
toNumbers.convert('One Hundred');      // 100
toNumbers.convert('oNe HuNdReD');      // 100
```

</details>

<details>
<summary><strong>Can I parse currency from different locales?</strong></summary>

Yes! Each locale has its own currency configuration:

```js
// Indian Rupees
const tnIN = new ToNumbers({ localeCode: 'en-IN' });
tnIN.convert('Five Hundred Rupees Only', { currency: true });
// 500

// US Dollars
const tnUS = new ToNumbers({ localeCode: 'en-US' });
tnUS.convert('Five Hundred Dollars Only', { currency: true });
// 500

// French Euros
const tnFR = new ToNumbers({ localeCode: 'fr-FR' });
tnFR.convert('Cinq Cents Euros', { currency: true });
// 500
```

</details>

<details>
<summary><strong>Does this work in the browser?</strong></summary>

Yes! Use the UMD bundles via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/to-numbers/dist/umd/en-US.min.js"></script>
<script>
  const toNumbers = new ToNumbers();
  console.log(toNumbers.convert('One Hundred Twenty Three'));
  // 123
</script>
```

</details>

<details>
<summary><strong>How do I add support for a new locale?</strong></summary>

See the [Contributing](#-contributing) section above. You'll need to create a locale file implementing the `LocaleInterface` and add tests.

</details>

<details>
<summary><strong>What about ordinal numbers (First, Second, Third)?</strong></summary>

Ordinal parsing is fully supported! The library automatically detects ordinal words:

```js
toNumbers.convert('First');        // 1
toNumbers.convert('Twenty Third'); // 23
toNumbers.convert('Hundredth');    // 100
```

Ordinal support is available for English locales. Other locales are being added progressively.

</details>

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## 📄 License

[MIT](LICENSE)
