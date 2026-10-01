'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteMember, reorderMember, toggleMember } from '@/lib/actions/members';
import type { MemberView } from '@/types/view-models';

export function MemberTable({ members }: { members: MemberView[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [pending, startTransition] = useTransition();
  const rows = members
    .filter((member) => `${member.name} ${member.slug} ${member.role}`.toLowerCase().includes(search.toLowerCase()))
    .filter((member) => status === 'all' || (status === 'published' && member.isPublished) || (status === 'draft' && !member.isPublished));
  function run(action: Promise<{ ok: boolean }>) {
    startTransition(() => { void action.then(() => router.refresh()); });
  }
  return <>
    <div className="filter-row"><label className="sr-only" htmlFor="member-search">Search members</label><input id="member-search" style={{ maxWidth: 260, minHeight: 36, border: '1px solid var(--line)', borderRadius: 999, padding: '0 13px', background: 'var(--surface)', color: 'var(--text)' }} placeholder="Search members" value={search} onChange={(event) => setSearch(event.target.value)} /><label className="sr-only" htmlFor="member-status">Filter member status</label><select id="member-status" className="filter-link" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></div>
    <div className="admin-table-wrap"><table className="admin-table"><caption className="sr-only">Member profiles</caption><thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead><tbody>{rows.map((member) => <tr key={member.id}><td><strong>{member.name}</strong><br /><span style={{ color: 'var(--muted)' }}>{member.slug}</span></td><td>{member.role}</td><td><button className={`status-pill ${member.isPublished ? '' : 'draft'}`} type="button" disabled={pending} onClick={() => run(toggleMember(member.id, !member.isPublished))}>{member.isPublished ? 'Published' : 'Draft'}</button></td><td><button className="icon-button" type="button" aria-label={`Move ${member.name} up`} disabled={pending} onClick={() => run(reorderMember(member.id, 'up'))}><ArrowUp size={14} /></button><button className="icon-button" type="button" aria-label={`Move ${member.name} down`} disabled={pending} onClick={() => run(reorderMember(member.id, 'down'))}><ArrowDown size={14} /></button></td><td><div className="admin-actions"><Link className="button" href={`/admin/members/${member.id}`} aria-label={`Edit ${member.name}`}><Pencil size={14} /></Link><button className="button" type="button" disabled={pending} aria-label={`Delete ${member.name}`} onClick={() => { if (window.confirm('Delete this member?')) run(deleteMember(member.id)); }}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>
  </>;
}
