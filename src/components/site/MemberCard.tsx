import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { MemberView } from '@/types/view-models';
import { initials } from '@/lib/utils';

export function MemberCard({ member, index }: { member: MemberView; index?: number }) {
  return <article className="member-card">
    <div className="member-avatar">{member.avatarUrl ? <Image src={member.avatarUrl} alt={`${member.name} portrait`} fill sizes="(max-width: 680px) 100vw, 360px" unoptimized={member.avatarUrl.startsWith('http')} /> : <span aria-hidden="true">{initials(member.name)}</span>}<span className="member-number" aria-hidden="true">{String((index ?? 0) + 1).padStart(2, '0')}</span></div>
    <div className="member-copy"><p className="member-role">{member.role}</p><h3>{member.name}</h3><p>{member.bio}</p>{member.linkedinUrl ? <a className="inline-link" href={member.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15} /></a> : null}</div>
  </article>;
}
