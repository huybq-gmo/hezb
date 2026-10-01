'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { deleteMessage, updateMessageStatus } from '@/lib/actions/messages';
import type { AdminMessage } from '@/lib/admin-data';
import { MessageStatusSelect } from './MessageStatusSelect';

export function MessageTable({ messages }: { messages: AdminMessage[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<AdminMessage | null>(null);
  const [status, setStatus] = useState<'all' | AdminMessage['status']>('all');
  const [pending, startTransition] = useTransition();
  const rows = status === 'all' ? messages : messages.filter((message) => message.status === status);
  function openMessage(message: AdminMessage) {
    setSelected(message);
    dialogRef.current?.showModal();
    if (message.status === 'new') {
      startTransition(() => { void updateMessageStatus(message.id, 'read').then(() => router.refresh()); });
    }
  }
  function remove(id: string) {
    if (!window.confirm('Delete this message?')) return;
    startTransition(() => { void deleteMessage(id).then(() => router.refresh()); });
  }
  return <>
    <div className="filter-row"><label className="sr-only" htmlFor="message-status">Filter message status</label><select id="message-status" className="filter-link" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All statuses</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select></div>
    <div className="admin-table-wrap"><table className="admin-table"><caption className="sr-only">Contact messages</caption><thead><tr><th>Sender</th><th>Company</th><th>Topic</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{rows.map((message) => <tr key={message.id}><td><button className="table-link" type="button" onClick={() => openMessage(message)}><strong>{message.name}</strong><br /><span style={{ color: 'var(--muted)' }}>{message.email}</span></button></td><td>{message.company || '-'}</td><td>{message.topic}</td><td><MessageStatusSelect id={message.id} status={message.status} /></td><td>{message.createdAt}</td><td><button className="button" type="button" disabled={pending} aria-label={`Delete message from ${message.name}`} onClick={() => remove(message.id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>
    <dialog ref={dialogRef} className="message-dialog" onClose={() => setSelected(null)}><div className="message-dialog-inner"><button className="button button-small" type="button" onClick={() => dialogRef.current?.close()}>Close</button>{selected ? <><p className="eyebrow">{selected.topic}</p><h2>{selected.name}</h2><p><a href={`mailto:${selected.email}`}>{selected.email}</a>{selected.company ? ` / ${selected.company}` : ''}</p><p className="message-body">{selected.message}</p><a className="button button-primary" href={`mailto:${selected.email}?subject=Re: Hezb contact`}>Reply by email</a></> : null}</div></dialog>
  </>;
}
