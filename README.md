# Words to Numbers

## Introduction

Convert words (including decimals) into numbers with multi-locale and currency support. The reverse of the `to-words` package. Ideal for parsing written amounts in invoicing, e-commerce, and financial apps.

### Features

- **Words to Numbers**: Convert text representations to integers and decimals.
- **Currency Support**: Parse currency text with locale-specific currency options.
- **Multi-Locale**: Supports 40+ languages and regions across multiple languages.
- **Highly Configurable**: Tailor parsing rules to your needs.
- **Case Insensitive**: Works with any case combination.

### Use Cases

- **Financial Applications**: Parse amount-in-words from invoices or cheques.
- **Voice/Speech Input**: Convert spoken numbers to numeric values.
- **Data Processing**: Parse textual number representations in documents.
- **Localization**: Support multiple languages and currencies seamlessly.

## Installation

```js
npm install to-numbers --save
```

## Usage

Importing

```js
const { ToNumbers } = require('to-numbers');
```

OR

```js
import { ToNumbers } from 'to-numbers';
```

### Basic Usage

```js
const toNumbers = new ToNumbers();

// Simple conversion
let number = toNumbers.convert('One Hundred Twenty Three');
// number = 123

number = toNumbers.convert('Three Point One Four');
// number = 3.14

number = toNumbers.convert('Minus Fifty');
// number = -50
```

### Config Options

```js
const toNumbers = new ToNumbers({
  localeCode: 'en-IN',
  converterOptions: {
    currency: false,
    ignoreDecimal: false,
  },
});
```

Options can be set at instance level, or along with individual call to `convert` method.

### Currency Mode

```js
const toNumbers = new ToNumbers({ localeCode: 'en-IN' });

let number = toNumbers.convert('Four Hundred Fifty Two Rupees Only', { currency: true });
// number = 452

number = toNumbers.convert('Four Hundred Fifty Two Rupees And Thirty Six Paise Only', { currency: true });
// number = 452.36
```

### Parse Method (Detailed Result)

```js
const toNumbers = new ToNumbers({ localeCode: 'en-IN' });

const result = toNumbers.parse('Fifty Two Rupees And Thirty Paise Only', { currency: true });
// result = {
//   value: 52.30,
//   isCurrency: true,
//   isNegative: false,
//   currencyInfo: {
//     mainAmount: 52,
//     fractionalAmount: 30
//   }
// }
```

### Different Locales

```js
// US English (Million, Billion, Trillion)
const toNumbersUS = new ToNumbers({ localeCode: 'en-US' });
toNumbersUS.convert('One Million');
// 1000000

// Indian English (Lakh, Crore)
const toNumbersIN = new ToNumbers({ localeCode: 'en-IN' });
toNumbersIN.convert('One Lakh');
// 100000

toNumbersIN.convert('One Crore');
// 10000000
```

## Options

| Option            | Type    | Default | Description                                                    |
| ----------------- | ------- | ------- | -------------------------------------------------------------- |
| localeCode        | string  | 'en-IN' | Locale code for selecting i18n.                                |
| currency          | boolean | false   | Whether to parse the input as currency format.                 |
| ignoreDecimal     | boolean | false   | Whether to ignore fractional part while parsing.               |
| fractionalPrecision | number | 2      | Decimal precision for currency fractional units (e.g., cents). |

## Supported Locales

| Country             | Language   | Locale          |
| ------------------- | ---------- | --------------- |
| UAE                 | Arabic     | ar-AE           |
| Morocco             | Arabic     | ar-MA           |
| Saudi Arabia        | Arabic     | ar-SA           |
| India               | Bengali    | bn-IN           |
| Estonia             | Estonian   | ee-EE           |
| UAE                 | English    | en-AE           |
| Australia           | English    | en-AU           |
| Bangladesh          | English    | en-BD           |
| UK                  | English    | en-GB           |
| Ghana               | English    | en-GH           |
| Ireland             | English    | en-IE           |
| India               | English    | en-IN (default) |
| Morocco             | English    | en-MA           |
| Myanmar             | English    | en-MM           |
| Mauritius           | English    | en-MU           |
| Nigeria             | English    | en-NG           |
| Nepal               | English    | en-NP           |
| Oman                | English    | en-OM           |
| Philippines         | English    | en-PH           |
| Saudi Arabia        | English    | en-SA           |
| USA                 | English    | en-US           |
| Argentina           | Spanish    | es-AR           |
| España              | Spanish    | es-ES           |
| Mexico              | Spanish    | es-MX           |
| Venezuela           | Spanish    | es-VE           |
| Iran                | Persian    | fa-IR           |
| Belgium             | French     | fr-BE           |
| France              | French     | fr-FR           |
| Morocco             | French     | fr-MA           |
| Saudi Arabia        | French     | fr-SA           |
| India               | Gujarati   | gu-IN           |
| India               | Hindi      | hi-IN           |
| India               | Kannada    | kn-IN           |
| South Korea         | Korean     | ko-KR           |
| Latvia              | Latvian    | lv-LV           |
| India               | Marathi    | mr-IN           |
| Suriname            | Dutch      | nl-SR           |
| Nepal               | Nepali     | np-NP           |
| Brazil              | Portuguese | pt-BR           |
| Turkey              | Turkish    | tr-TR           |
| Pakistan            | Urdu       | ur-PK           |

## Error Handling

```js
const toNumbers = new ToNumbers();

// Invalid input throws an error
try {
  toNumbers.convert('');
} catch (error) {
  console.error(error.message); // 'Invalid Input ""'
}

// Unknown locale throws an error
try {
  const invalidLocale = new ToNumbers({ localeCode: 'xx-XX' });
  invalidLocale.convert('One');
} catch (error) {
  console.error(error.message); // 'Unknown Locale "xx-XX"'
}
```

## License

[MIT](LICENSE)
