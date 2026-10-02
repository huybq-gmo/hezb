import type { Metadata } from 'next';
import type { Locale } from '@/types/db';

export const socialPreviewImage = {
  url: '/brand/hezb-social-card.jpg',
  width: 1200,
  height: 630,
  alt: "Hezb community - Build what's next",
};

export function localizedMetadata(locale: Locale, title: string, description: string, path = ''): Metadata {
  const localizedPath = `/${locale}${path}`;
  const alternatePath = path || '';
  const localizedImage = {
    ...socialPreviewImage,
    alt: locale === 'vi' ? 'Cộng đồng Hezb - Xây dựng điều tiếp theo' : socialPreviewImage.alt,
  };
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
      siteName: 'Hezb Community',
      images: [localizedImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [localizedImage.url],
    },
  };
}
