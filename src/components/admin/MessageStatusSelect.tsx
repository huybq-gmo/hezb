'use client';

import { useTransition } from 'react';
import { updateMessageStatus } from '@/lib/actions/messages';

export function MessageStatusSelect({ id, status }: { id: string; status: 'new' | 'read' | 'replied' | 'archived' }) {
  const [pending, startTransition] = useTransition();
  return <select aria-label="Message status" value={status} disabled={pending} onChange={(event) => { const next = event.target.value as 'new' | 'read' | 'replied' | 'archived'; startTransition(() => { void updateMessageStatus(id, next); }); }}><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select>;
}
