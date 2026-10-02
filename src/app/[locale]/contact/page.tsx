import { getMessages } from '@/lib/i18n';
import { isLocale } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/site/ContactForm';
import { localizedMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/queries/settings';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const messages = getMessages(rawLocale);
  return localizedMetadata(rawLocale, messages.contact.title, messages.contact.intro, '/contact');
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound();
  const messages = getMessages(rawLocale);
  const settings = await getSiteSettings(rawLocale);
  return <><section className="page-hero"><div className="container"><p className="eyebrow">{messages.contact.eyebrow}</p><h1>{messages.contact.title}</h1><p>{messages.contact.intro}</p></div></section><section className="section"><div className="container contact-layout"><ContactForm locale={rawLocale} messages={messages} /><aside className="contact-details"><div className="contact-detail"><small>{messages.contact.email}</small><strong><a href={`mailto:${settings.email}`}>{settings.email}</a></strong></div><div className="contact-detail"><small>{messages.contact.phone}</small><strong><a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>{settings.phone}</a></strong></div><div className="contact-detail"><small>{messages.contact.addressLabel}</small><strong>{settings.address}</strong></div><div className="contact-detail"><small>{messages.contact.responseTime}</small><strong>{settings.responseTime}</strong></div></aside></div></section></>;
}
