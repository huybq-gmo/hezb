import Link from 'next/link';
import type { Locale } from '@/types/db';

export function LangSwitch({ locale, label }: { locale: Locale; label: string }) {
  const nextLocale = locale === 'vi' ? 'en' : 'vi';
  return <Link className="locale-switch" href={`/${nextLocale}`} aria-label={label}>{nextLocale.toUpperCase()}</Link>;
}
