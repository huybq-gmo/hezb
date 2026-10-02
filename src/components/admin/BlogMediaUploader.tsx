'use client';

import Image from 'next/image';
import { FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { BlogAttachmentInput } from '@/lib/validators/blog';

const acceptedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const acceptedFiles = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const maxFileSize = 5 * 1024 * 1024;

export function BlogMediaUploader({ value, onChange }: { value: BlogAttachmentInput[]; onChange: (items: BlogAttachmentInput[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    if (value.length + files.length > 20) { setError('A post can have up to 20 attachments.'); return; }
    const selected = Array.from(files);
    const invalid = selected.find((file) => (!acceptedImages.includes(file.type) && !acceptedFiles.includes(file.type)) || file.size > maxFileSize);
    if (invalid) { setError('Use JPG, PNG, WebP, AVIF, PDF, DOC or DOCX files up to 5 MB each.'); return; }
    setBusy(true);
    const client = getBrowserClient();
    const uploaded: BlogAttachmentInput[] = [];
    for (const file of selected) {
      const id = crypto.randomUUID();
      const kind = acceptedImages.includes(file.type) ? 'image' : 'file';
      if (!client) {
        uploaded.push({ id, kind, name: file.name, url: URL.createObjectURL(file), contentType: file.type, sizeBytes: file.size, sortOrder: (value.length + uploaded.length + 1) * 10 });
        continue;
      }
      const path = `posts/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const result = await client.storage.from('blog-media').upload(path, file, { contentType: file.type, upsert: false });
      if (result.error) { setError(result.error.message); setBusy(false); return; }
      const { data } = client.storage.from('blog-media').getPublicUrl(path);
      uploaded.push({ id, kind, name: file.name, url: data.publicUrl, contentType: file.type, sizeBytes: file.size, sortOrder: (value.length + uploaded.length + 1) * 10 });
    }
    onChange([...value, ...uploaded]);
    setBusy(false);
  }

  function remove(id: string) {
    onChange(value.filter((item) => item.id !== id).map((item, index) => ({ ...item, sortOrder: (index + 1) * 10 })));
  }

  return <div className="blog-media-uploader">
    <div className="blog-media-toolbar"><label className="button blog-upload-button" htmlFor="blog-attachments"><Upload size={15} />{busy ? 'Uploading...' : 'Attach media'}</label><input id="blog-attachments" type="file" multiple accept={[...acceptedImages, ...acceptedFiles].join(',')} disabled={busy} onChange={(event) => { void upload(event.target.files); event.currentTarget.value = ''; }} /><small>Up to 20 images or files, 5 MB each.</small></div>
    {error ? <p className="field-error" role="alert">{error}</p> : null}
    {value.length ? <ul className="blog-media-list">{value.map((item) => <li className="blog-media-item" key={item.id}>
      {item.kind === 'image' ? <Image src={item.url} alt={item.name} width={112} height={72} unoptimized /> : <span className="blog-file-icon" aria-hidden="true"><FileText size={22} /></span>}
      <div className="blog-media-item-copy"><strong>{item.name}</strong><span>{item.kind === 'image' ? 'Image' : 'Downloadable file'} · {Math.max(1, Math.round(item.sizeBytes / 1024))} KB</span></div>
      <button className="icon-button" type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={15} /></button>
    </li>)}</ul> : <div className="blog-media-empty"><ImageIcon size={18} /><span>No attachments yet. Add images to make the story more visual.</span></div>}
  </div>;
}
