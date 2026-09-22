import type { Locale } from '@/lib/i18n/config';

const formatters: Record<Locale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'RUB',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }),
  ru: new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }),
};

export const formatPrice = (value: number, locale: Locale) => formatters[locale].format(value);
