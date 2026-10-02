import { MemberCard } from '@/components/site/MemberCard';
import { getMessages } from '@/lib/i18n';
import { getMembers } from '@/lib/queries/members';
import { isLocale } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { localizedMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const messages = getMessages(rawLocale);
  return localizedMetadata(rawLocale, messages.members.title, messages.members.body, '/members');
}

export default async function MembersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound();
  const messages = getMessages(rawLocale); const members = await getMembers(rawLocale);
  return <><section className="page-hero"><div className="container"><p className="eyebrow">{messages.members.eyebrow}</p><h1>{messages.members.title}</h1><p>{messages.members.body}</p></div></section><section className="section"><div className="container">{members.length ? <div className="member-grid">{members.map((member, index) => <MemberCard key={member.id} member={member} index={index} />)}</div> : <div className="empty-state">{messages.common.empty}</div>}</div></section></>;
}
