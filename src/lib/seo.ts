import type { Metadata } from 'next';
import type { Locale } from '@/types/db';

export function localizedMetadata(locale: Locale, title: string, description: string, path = ''): Metadata {
  const localizedPath = `/${locale}${path}`;
  const alternatePath = path || '';
  return {
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages: { vi: `/vi${alternatePath}`, en: `/en${alternatePath}` },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: localizedPath,
      locale,
    },
  };
}
