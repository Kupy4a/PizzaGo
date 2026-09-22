import { describe, expect, it } from 'vitest';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { locales, toLocale } from '@/lib/i18n/config';
import { formatPrice } from '@/lib/format';
import { getMenu } from '@/lib/menu';

// Flattens nested keys: { a: { b: 1 } } -> ['a.b']
const keys = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );

describe('i18n', () => {
  it('has the same keys in every language', () => {
    const [first, ...rest] = locales.map((l) => keys(getDictionary(l)).sort());
    rest.forEach((k) => expect(k).toEqual(first));
  });

  it('falls back to English for unknown locales', () => {
    expect(toLocale('de')).toBe('en');
    expect(toLocale(undefined)).toBe('en');
    expect(toLocale('ru')).toBe('ru');
  });

  it('translates every menu item', () => {
    for (const locale of locales) {
      const menu = getMenu(locale);
      for (const p of menu.products) {
        expect(p.name, p.id).not.toBe('');
        expect(p.description, p.id).not.toBe('');
        expect(menu.categories.some((c) => c.id === p.category_id), p.id).toBe(true);
      }
    }
    expect(getMenu('en').productById.get('p1')?.name).toBe('Margherita');
    expect(getMenu('ru').productById.get('p1')?.name).toBe('Маргарита');
  });

  it('formats prices per locale', () => {
    expect(formatPrice(1547, 'en')).toBe('₽1,547');
    expect(formatPrice(1547, 'ru').replace(/\s/g, ' ')).toBe('1 547 ₽');
  });
});
