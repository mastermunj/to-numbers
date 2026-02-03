import { bench, describe } from 'vitest';
import { ToNumbers } from '../src/ToNumbers.js';

// Test instances for different locales
const instances = {
  'en-IN': new ToNumbers({ localeCode: 'en-IN' }),
  'en-US': new ToNumbers({ localeCode: 'en-US' }),
  'en-GB': new ToNumbers({ localeCode: 'en-GB' }),
  'es-ES': new ToNumbers({ localeCode: 'es-ES' }),
  'es-MX': new ToNumbers({ localeCode: 'es-MX' }),
  'fr-FR': new ToNumbers({ localeCode: 'fr-FR' }),
  'ar-AE': new ToNumbers({ localeCode: 'ar-AE' }),
  'hi-IN': new ToNumbers({ localeCode: 'hi-IN' }),
  'pt-BR': new ToNumbers({ localeCode: 'pt-BR' }),
  'ko-KR': new ToNumbers({ localeCode: 'ko-KR' }),
};

// Test data for different scenarios
const testData = {
  'en-IN': {
    smallInt: 'Forty Two',
    mediumInt: 'Twelve Thousand Three Hundred Forty Five',
    largeInt:
      'Nine Trillion Eight Hundred Seventy Six Billion Five Hundred Forty Three Million Two Hundred Ten Thousand Nine Hundred Eighty Seven',
    currency: 'Nine Hundred Eighty Seven Indian Rupees And Sixty Five Paise',
    ordinal: 'Twenty First',
  },
  'en-US': {
    smallInt: 'Forty Two',
    mediumInt: 'Twelve Thousand Three Hundred Forty Five',
    largeInt:
      'Nine Trillion Eight Hundred Seventy Six Billion Five Hundred Forty Three Million Two Hundred Ten Thousand Nine Hundred Eighty Seven',
    currency: 'Nine Hundred Eighty Seven US Dollars And Sixty Five Cents',
    ordinal: 'Twenty First',
  },
  'en-GB': {
    smallInt: 'Forty Two',
    mediumInt: 'Twelve Thousand Three Hundred And Forty Five',
    largeInt:
      'Nine Trillion Eight Hundred And Seventy Six Billion Five Hundred And Forty Three Million Two Hundred And Ten Thousand Nine Hundred And Eighty Seven',
    currency: 'Nine Hundred And Eighty Seven Pounds And Sixty Five Pence',
    ordinal: 'Twenty First',
  },
  'es-ES': {
    smallInt: 'Cuarenta Y Dos',
    mediumInt: 'Doce Mil Trescientos Cuarenta Y Cinco',
    largeInt:
      'Nueve Billones Ochocientos Setenta Y Seis Mil Quinientos Cuarenta Y Tres Millones Doscientos Diez Mil Novecientos Ochenta Y Siete',
    currency: 'Novecientos Ochenta Y Siete Euros Con Sesenta Y Cinco Centimos',
    ordinal: 'Vigésimo Primero',
  },
  'es-MX': {
    smallInt: 'Cuarenta Y Dos',
    mediumInt: 'Doce Mil Trescientos Cuarenta Y Cinco',
    largeInt:
      'Nueve Billones Ochocientos Setenta Y Seis Mil Quinientos Cuarenta Y Tres Millones Doscientos Diez Mil Novecientos Ochenta Y Siete',
    currency: 'Novecientos Ochenta Y Siete Pesos Mexicanos Con Sesenta Y Cinco Centavos',
    ordinal: 'Vigésimo Primero',
  },
  'fr-FR': {
    smallInt: 'Quarante-Deux',
    mediumInt: 'Douze Mille Trois Cent Quarante-Cinq',
    largeInt:
      'Neuf Billion Huit Cent Soixante-Seize Milliard Cinq Cent Quarante-Trois Million Deux Cent Dix Mille Neuf Cent Quatre-Vingt-Sept',
    currency: 'Neuf Cent Quatre-Vingt-Sept Euros Et Soixante-Cinq Centimes',
    ordinal: 'Vingtième',
  },
  'ar-AE': {
    smallInt: 'اثنان وأربعون',
    mediumInt: 'اثنا عشر ألف وثلاثمائة وخمسة وأربعون',
    largeInt:
      'تسعة تريليون وثمانمائة وستة وسبعون مليار وخمسمائة وثلاثة وأربعون مليون ومائتان وعشرة ألف وتسعمائة وسبعة وثمانون',
    currency: 'تسعمائة وسبعة وثمانون درهم إماراتي وخمسة وستون فلس',
    ordinal: 'العشرون',
  },
  'hi-IN': {
    smallInt: 'बयालीस',
    mediumInt: 'बारह हज़ार तीन सौ पैंतालीस',
    largeInt: 'नौ खरब सत्तासी अरब पचपन करोड़ तेईस लाख इक्कीस हज़ार नौ सौ सतासी',
    currency: 'नौ सौ सतासी भारतीय रुपये और पैंसठ पैसे',
    ordinal: 'बीसवां',
  },
  'pt-BR': {
    smallInt: 'Quarenta E Dois',
    mediumInt: 'Doze Mil Trezentos E Quarenta E Cinco',
    largeInt:
      'Nove Trilhões Oitocentos E Setenta E Seis Bilhões Quinhentos E Quarenta E Três Milhões Duzentos E Dez Mil Novecentos E Oitenta E Sete',
    currency: 'Novecentos E Oitenta E Sete Reais E Sessenta E Cinco Centavos',
    ordinal: 'Vigésimo',
  },
  'ko-KR': {
    smallInt: '사십이',
    mediumInt: '일만 이천삼백사십오',
    largeInt: '구조 팔천칠백육십오억 사천삼백이십일만 구백팔십칠',
    currency: '구백팔십칠 대한민국 원 육십오 전',
    ordinal: '스무번째',
  },
};

describe('ToNumbers Performance Benchmarks', () => {
  describe('Small Integer (42)', () => {
    for (const [locale, instance] of Object.entries(instances)) {
      const data = testData[locale as keyof typeof testData];
      bench(`${locale}`, () => {
        instance.convert(data.smallInt);
      });
    }
  });

  describe('Medium Integer (12,345)', () => {
    for (const [locale, instance] of Object.entries(instances)) {
      const data = testData[locale as keyof typeof testData];
      bench(`${locale}`, () => {
        instance.convert(data.mediumInt);
      });
    }
  });

  describe('Large Integer (9,876,543,210,987)', () => {
    for (const [locale, instance] of Object.entries(instances)) {
      const data = testData[locale as keyof typeof testData];
      bench(`${locale}`, () => {
        instance.convert(data.largeInt);
      });
    }
  });

  describe('Currency Parsing', () => {
    for (const [locale, instance] of Object.entries(instances)) {
      const data = testData[locale as keyof typeof testData];
      bench(`${locale}`, () => {
        instance.convert(data.currency);
      });
    }
  });

  describe('Ordinal Parsing', () => {
    for (const [locale, instance] of Object.entries(instances)) {
      const data = testData[locale as keyof typeof testData];
      bench(`${locale}`, () => {
        instance.convert(data.ordinal);
      });
    }
  });

  describe('Instance Creation', () => {
    for (const locale of Object.keys(instances)) {
      bench(`${locale}`, () => {
        new ToNumbers({ localeCode: locale });
      });
    }
  });

  describe('Parse Method (with metadata)', () => {
    for (const [locale, instance] of Object.entries(instances)) {
      const data = testData[locale as keyof typeof testData];
      bench(`${locale}`, () => {
        instance.parse(data.mediumInt);
      });
    }
  });
});
