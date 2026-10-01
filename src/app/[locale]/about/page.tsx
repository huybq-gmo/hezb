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
  return localizedMetadata(rawLocale, messages.about.title, messages.about.intro, '/about');
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound();
  const messages = getMessages(rawLocale);
  return <><section className="page-hero"><div className="container"><p className="eyebrow">{messages.about.eyebrow}</p><h1>{messages.about.title}</h1><p>{messages.about.intro}</p></div></section><section className="section"><div className="container"><div className="feature-grid">{messages.about.sections.map(([title, body], index) => <article className="feature-card" key={title}><span className="feature-index">0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div><div style={{ marginTop: 46 }}><Link className="button button-primary" href={`/${rawLocale}/contact`}>{messages.common.contact} <ArrowRight size={16} /></Link></div></div></section></>;
}
