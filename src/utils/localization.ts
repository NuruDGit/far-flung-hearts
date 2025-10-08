import { format as dateFnsFormat, formatDistance as dateFnsFormatDistance } from 'date-fns';
import { enUS, es, fr, de, ja, ar, he, zhCN } from 'date-fns/locale';

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ar' | 'he' | 'zh';

const locales = {
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  ja: ja,
  ar: ar,
  he: he,
  zh: zhCN,
};

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  AED: 'د.إ',
  SAR: '﷼',
};

export const formatDate = (
  date: Date,
  formatStr: string,
  locale: SupportedLocale = 'en'
): string => {
  return dateFnsFormat(date, formatStr, { locale: locales[locale] });
};

export const formatRelativeTime = (
  date: Date,
  baseDate: Date,
  locale: SupportedLocale = 'en'
): string => {
  return dateFnsFormatDistance(date, baseDate, {
    addSuffix: true,
    locale: locales[locale],
  });
};

export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: SupportedLocale = 'en'
): string => {
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ja: 'ja-JP',
    ar: 'ar-SA',
    he: 'he-IL',
    zh: 'zh-CN',
  };

  try {
    return new Intl.NumberFormat(localeMap[locale], {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    // Fallback to symbol + number
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
};

export const formatNumber = (
  value: number,
  locale: SupportedLocale = 'en',
  options?: Intl.NumberFormatOptions
): string => {
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    ja: 'ja-JP',
    ar: 'ar-SA',
    he: 'he-IL',
    zh: 'zh-CN',
  };

  return new Intl.NumberFormat(localeMap[locale], options).format(value);
};

export const isRTLLocale = (locale: SupportedLocale): boolean => {
  return locale === 'ar' || locale === 'he';
};
