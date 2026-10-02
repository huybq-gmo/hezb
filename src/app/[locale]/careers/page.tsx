import { getMessages } from '@/lib/i18n';
import { JobBoard } from '@/components/site/JobBoard';
import { getPublishedJobs } from '@/lib/queries/careers';
import { isLocale } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { localizedMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const messages = getMessages(rawLocale);
  return localizedMetadata(rawLocale, messages.careers.title, messages.careers.intro, '/careers');
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound();
  const messages = getMessages(rawLocale);
  const jobs = await getPublishedJobs(rawLocale);
  return <><section className="page-hero"><div className="container"><p className="eyebrow">{messages.careers.eyebrow}</p><h1>{messages.careers.title}</h1><p>{messages.careers.intro}</p></div></section><section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">{messages.careers.rolesEyebrow}</p><h2>{messages.careers.openings}</h2></div><p className="section-intro">{messages.careers.rolesBody}</p></div><JobBoard locale={rawLocale} jobs={jobs} messages={messages} /></div></section></>;
}
