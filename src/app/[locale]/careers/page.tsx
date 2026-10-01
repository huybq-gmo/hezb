import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getMessages } from '@/lib/i18n';
import { isLocale } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { localizedMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const messages = getMessages(rawLocale);
  return localizedMetadata(rawLocale, messages.careers.title, messages.careers.intro, '/careers');
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound();
  const messages = getMessages(rawLocale);
  return <><section className="page-hero"><div className="container"><p className="eyebrow">{messages.careers.eyebrow}</p><h1>{messages.careers.title}</h1><p>{messages.careers.intro}</p></div></section><section className="section"><div className="container"><div className="form-panel" style={{ maxWidth: 720 }}><p className="eyebrow">{messages.careers.rolesEyebrow}</p><h2>{messages.careers.status}</h2><p className="section-intro">{messages.careers.rolesBody}</p></div><div style={{ marginTop: 34 }}><Link className="button button-primary" href={`/${rawLocale}/contact`}>{messages.common.contact} <ArrowRight size={16} /></Link></div></div></section></>;
}
