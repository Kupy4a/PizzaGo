import { cookies } from 'next/headers';
import { LOCALE_COOKIE, toLocale, type Locale } from './config';

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return toLocale(store.get(LOCALE_COOKIE)?.value);
}
