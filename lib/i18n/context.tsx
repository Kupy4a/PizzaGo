'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Locale } from './config';
import { getDictionary, type Dictionary } from './dictionaries';
import { getMenu, type Menu } from '@/lib/menu';

interface I18nValue {
  locale: Locale;
  t: Dictionary;
  menu: Menu;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(
    () => ({ locale, t: getDictionary(locale), menu: getMenu(locale) }),
    [locale]
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
