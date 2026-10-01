import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { getMessages } from '@/lib/i18n';
import { locales, isLocale } from '@/i18n/routing';

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const messages = getMessages(rawLocale);
  return { title: { default: messages.metadata.title, template: `%s | Hezb` }, description: messages.metadata.description, alternates: { languages: { vi: '/vi', en: '/en' } }, openGraph: { title: messages.metadata.title, description: messages.metadata.description, type: 'website' } };
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const messages = getMessages(rawLocale);
  return <><a className="skip-link" href="#main-content">Skip to content</a><Header locale={rawLocale} messages={messages} /><main id="main-content">{children}</main><Footer locale={rawLocale} messages={messages} /></>;
}
