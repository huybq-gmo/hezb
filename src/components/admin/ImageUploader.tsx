'use client';

import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

const accepted = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function ImageUploader({ bucket, onUploaded }: { bucket: 'project-media' | 'member-media'; onUploaded: (url: string) => void }) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setError(''); if (!accepted.includes(file.type)) { setError('Use JPEG, PNG, WebP or AVIF.'); return; } if (file.size > 5 * 1024 * 1024) { setError('Images must be 5 MB or smaller.'); return; }
    const client = getBrowserClient(); if (!client) { onUploaded(URL.createObjectURL(file)); return; }
    setBusy(true); const path = `${bucket === 'project-media' ? 'projects' : 'members'}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`; const result = await client.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false }); setBusy(false); if (result.error) { setError(result.error.message); return; } const { data } = client.storage.from(bucket).getPublicUrl(path); onUploaded(data.publicUrl);
  }
  return <div><label htmlFor={`${bucket}-upload`}>Cover image</label><input id={`${bucket}-upload`} type="file" accept={accepted.join(',')} disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />{error ? <p className="field-error">{error}</p> : null}<small style={{ color: 'var(--muted)' }}>JPEG, PNG, WebP or AVIF, max 5 MB.</small></div>;
}
