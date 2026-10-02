'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteJob, reorderJob, toggleJob } from '@/lib/actions/careers';
import type { JobView } from '@/types/view-models';

export function JobTable({ jobs }: { jobs: JobView[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [pending, startTransition] = useTransition();
  const rows = jobs.filter((job) => `${job.title} ${job.slug}`.toLowerCase().includes(search.toLowerCase())).filter((job) => status === 'all' || (status === 'published' && job.isPublished) || (status === 'draft' && !job.isPublished));
  function run(action: Promise<{ ok: boolean }>) {
    startTransition(() => { void action.then(() => router.refresh()); });
  }
  return <>
    <div className="filter-row"><label className="sr-only" htmlFor="job-search">Search jobs</label><input id="job-search" style={{ maxWidth: 260, minHeight: 36, border: '1px solid var(--line)', borderRadius: 999, padding: '0 13px', background: 'var(--surface)', color: 'var(--text)' }} placeholder="Search roles" value={search} onChange={(event) => setSearch(event.target.value)} /><label className="sr-only" htmlFor="job-status">Filter job status</label><select id="job-status" className="filter-link" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></div>
    <div className="admin-table-wrap"><table className="admin-table"><caption className="sr-only">Career roles</caption><thead><tr><th>Role</th><th>Engagement</th><th>Location</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead><tbody>{rows.map((job) => <tr key={job.id}><td><strong>{job.title}</strong><br /><span style={{ color: 'var(--muted)' }}>{job.slug}</span></td><td>{job.employmentType.replace('_', ' ')}</td><td>{job.location}</td><td><button className={`status-pill ${job.isPublished ? '' : 'draft'}`} type="button" disabled={pending} onClick={() => run(toggleJob(job.id, !job.isPublished))}>{job.isPublished ? 'Published' : 'Draft'}</button></td><td><button className="icon-button" type="button" aria-label={`Move ${job.title} up`} disabled={pending} onClick={() => run(reorderJob(job.id, 'up'))}><ArrowUp size={14} /></button><button className="icon-button" type="button" aria-label={`Move ${job.title} down`} disabled={pending} onClick={() => run(reorderJob(job.id, 'down'))}><ArrowDown size={14} /></button></td><td><div className="admin-actions"><Link className="button" href={`/admin/careers/${job.id}`} aria-label={`Edit ${job.title}`}><Pencil size={14} /></Link><button className="button" type="button" disabled={pending} aria-label={`Delete ${job.title}`} onClick={() => { if (window.confirm('Delete this role and its applications?')) run(deleteJob(job.id)); }}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>
  </>;
}
