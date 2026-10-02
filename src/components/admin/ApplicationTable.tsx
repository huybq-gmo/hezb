'use client';

import { FileDown, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { deleteApplication, getApplicationCvUrl, updateApplicationStatus } from '@/lib/actions/careers';
import type { JobApplicationView } from '@/types/view-models';

const statuses: JobApplicationView['status'][] = ['new', 'reviewing', 'shortlisted', 'rejected', 'archived'];

export function ApplicationTable({ applications }: { applications: JobApplicationView[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<JobApplicationView | null>(null);
  const [status, setStatus] = useState<'all' | JobApplicationView['status']>('all');
  const [pending, startTransition] = useTransition();
  const rows = status === 'all' ? applications : applications.filter((application) => application.status === status);
  function changeStatus(id: string, value: string) {
    startTransition(() => { void updateApplicationStatus(id, value).then(() => router.refresh()); });
  }
  function open(application: JobApplicationView) {
    setSelected(application);
    dialogRef.current?.showModal();
  }
  function download(application: JobApplicationView) {
    const popup = window.open('', '_blank');
    startTransition(() => { void getApplicationCvUrl(application.cvPath).then((result) => { if (result.ok && popup) popup.location.href = result.url; else popup?.close(); }); });
  }
  function remove(id: string) {
    if (!window.confirm('Delete this application and CV?')) return;
    startTransition(() => { void deleteApplication(id).then(() => router.refresh()); });
  }
  return <>
    <div className="filter-row"><label className="sr-only" htmlFor="application-status">Filter applications</label><select id="application-status" className="filter-link" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All applications</option>{statuses.map((item) => <option value={item} key={item}>{item}</option>)}</select></div>
    <div className="admin-table-wrap"><table className="admin-table"><caption className="sr-only">Job applications</caption><thead><tr><th>Candidate</th><th>Role</th><th>Status</th><th>CV</th><th>Date</th><th>Actions</th></tr></thead><tbody>{rows.map((application) => <tr key={application.id}><td><button className="table-link" type="button" onClick={() => open(application)}><strong>{application.name}</strong><br /><span style={{ color: 'var(--muted)' }}>{application.email}</span></button></td><td>{application.jobTitle}</td><td><select className="status-select" value={application.status} disabled={pending} onChange={(event) => changeStatus(application.id, event.target.value)} aria-label={`Status for ${application.name}`}>{statuses.map((item) => <option value={item} key={item}>{item}</option>)}</select></td><td><button className="button" type="button" disabled={pending} aria-label={`Open CV for ${application.name}`} onClick={() => download(application)}><FileDown size={14} /></button></td><td>{new Date(application.createdAt).toLocaleDateString()}</td><td><button className="button" type="button" disabled={pending} aria-label={`Delete application from ${application.name}`} onClick={() => remove(application.id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>
    <dialog ref={dialogRef} className="message-dialog" onClose={() => setSelected(null)}><div className="message-dialog-inner"><button className="button button-small" type="button" onClick={() => dialogRef.current?.close()}>Close</button>{selected ? <><p className="eyebrow">{selected.jobTitle}</p><h2>{selected.name}</h2><p><a href={`mailto:${selected.email}`}>{selected.email}</a>{selected.phone ? ` / ${selected.phone}` : ''}</p>{selected.portfolioUrl ? <p><a href={selected.portfolioUrl} target="_blank" rel="noreferrer">Portfolio</a></p> : null}<p className="message-body">{selected.coverNote}</p><button className="button button-primary" type="button" onClick={() => download(selected)}><FileDown size={15} /> Open CV</button></> : null}</div></dialog>
  </>;
}
