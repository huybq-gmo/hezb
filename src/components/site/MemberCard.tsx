import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { MemberView } from '@/types/view-models';
import { initials } from '@/lib/utils';

export function MemberCard({ member }: { member: MemberView }) {
  return <article className="member-card">
    <div className="member-avatar">{member.avatarUrl ? <Image src={member.avatarUrl} alt={`${member.name} portrait`} fill sizes="112px" unoptimized /> : <span aria-hidden="true">{initials(member.name)}</span>}</div>
    <div><p className="member-role">{member.role}</p><h3>{member.name}</h3><p>{member.bio}</p>{member.linkedinUrl ? <a className="inline-link" href={member.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={15} /></a> : null}</div>
  </article>;
}
