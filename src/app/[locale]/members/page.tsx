import { MemberCard } from '@/components/site/MemberCard';
import { getMessages } from '@/lib/i18n';
import { getMembers } from '@/lib/queries/members';
import { isLocale } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export default async function MembersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound();
  const messages = getMessages(rawLocale); const members = await getMembers(rawLocale);
  return <><section className="page-hero"><div className="container"><p className="eyebrow">People / Hezb</p><h1>{messages.members.title}</h1><p>{messages.members.body}</p></div></section><section className="section"><div className="container">{members.length ? <div className="member-grid">{members.map((member) => <MemberCard key={member.id} member={member} />)}</div> : <div className="empty-state">{messages.common.empty}</div>}</div></section></>;
}
