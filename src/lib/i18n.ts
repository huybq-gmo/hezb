import en from '../../messages/en.json';
import vi from '../../messages/vi.json';
import type { Locale } from '@/types/db';

export type Messages = typeof vi;
const messages: Record<Locale, Messages> = { vi, en: en as Messages };

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
