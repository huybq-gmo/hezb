import type { Locale } from '@/types/db';

export const locales: Locale[] = ['vi', 'en'];
export const defaultLocale: Locale = 'vi';

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
