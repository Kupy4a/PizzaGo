'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { LOCALE_COOKIE, locales, type Locale } from '@/lib/i18n/config';

function saveLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export const LanguageSwitcher: React.FC = () => {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === locale) return;
    saveLocale(next);
    startTransition(() => router.refresh());
  };

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className={`flex rounded-full bg-gray-100 p-0.5 text-xs font-semibold ${pending ? 'opacity-60' : ''}`}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          aria-pressed={l === locale}
          className={`px-2.5 py-1 rounded-full uppercase transition-colors ${
            l === locale ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-secondary'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
};
