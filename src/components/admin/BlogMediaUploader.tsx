'use client';

import Image from 'next/image';
import { FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { maxImageSourceBytes, maxImageStoredBytes, optimizeImage } from '@/lib/image-optimization';
import type { BlogAttachmentInput } from '@/lib/validators/blog';
import { storagePathsFromPublicUrls } from '@/lib/storage';

const acceptedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const acceptedFiles = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const maxFileSize = 5 * 1024 * 1024;

export function BlogMediaUploader({ value, persistedUrls = [], onChange }: { value: BlogAttachmentInput[]; persistedUrls?: string[]; onChange: (items: BlogAttachmentInput[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    if (value.length + files.length > 20) { setError('A post can have up to 20 attachments.'); return; }
    const selected = Array.from(files);
    const invalid = selected.find((file) => (!acceptedImages.includes(file.type) && !acceptedFiles.includes(file.type)) || (acceptedImages.includes(file.type) ? file.size > maxImageSourceBytes : file.size > maxFileSize));
    if (invalid) { setError('Use JPG, PNG, WebP or AVIF images up to 20 MB before optimization, or PDF/DOC/DOCX files up to 5 MB.'); return; }
    setBusy(true);
    const client = getBrowserClient();
    const uploaded: BlogAttachmentInput[] = [];
    for (const file of selected) {
      const id = crypto.randomUUID();
      const kind = acceptedImages.includes(file.type) ? 'image' : 'file';
      let uploadFile = file;
      if (kind === 'image') {
        try { uploadFile = await optimizeImage(file); } catch (optimizationError) { const paths = storagePathsFromPublicUrls(uploaded.map((item) => item.url), 'blog-media'); if (client && paths.length) await client.storage.from('blog-media').remove(paths); setError(optimizationError instanceof Error ? optimizationError.message : 'Unable to optimize this image.'); setBusy(false); return; }
        if (uploadFile.size > maxImageStoredBytes) { const paths = storagePathsFromPublicUrls(uploaded.map((item) => item.url), 'blog-media'); if (client && paths.length) await client.storage.from('blog-media').remove(paths); setError('This image is still larger than 5 MB after optimization.'); setBusy(false); return; }
      }
      if (!client) {
        uploaded.push({ id, kind, name: file.name, url: URL.createObjectURL(uploadFile), contentType: uploadFile.type, sizeBytes: uploadFile.size, sortOrder: (value.length + uploaded.length + 1) * 10 });
        continue;
      }
      const path = `posts/${id}-${uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const result = await client.storage.from('blog-media').upload(path, uploadFile, { contentType: uploadFile.type, upsert: false });
      if (result.error) { const paths = storagePathsFromPublicUrls(uploaded.map((item) => item.url), 'blog-media'); if (paths.length) await client.storage.from('blog-media').remove(paths); setError(result.error.message.includes('Bucket not found') ? 'Storage bucket is missing. Apply the Supabase migrations before uploading media.' : result.error.message); setBusy(false); return; }
      const { data } = client.storage.from('blog-media').getPublicUrl(path);
      uploaded.push({ id, kind, name: file.name, url: data.publicUrl, contentType: uploadFile.type, sizeBytes: uploadFile.size, sortOrder: (value.length + uploaded.length + 1) * 10 });
    }
    onChange([...value, ...uploaded]);
    setBusy(false);
  }

  async function remove(id: string) {
    const item = value.find((candidate) => candidate.id === id);
    if (!item) return;
    const client = getBrowserClient();
    setBusy(true); setError('');
    try {
      if (client && !persistedUrls.includes(item.url)) { const paths = storagePathsFromPublicUrls([item.url], 'blog-media'); if (paths.length) { const result = await client.storage.from('blog-media').remove(paths); if (result.error) throw new Error(result.error.message); } }
      onChange(value.filter((candidate) => candidate.id !== id).map((candidate, index) => ({ ...candidate, sortOrder: (index + 1) * 10 })));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'The attachment could not be removed.');
    } finally { setBusy(false); }
  }

  return <div className="blog-media-uploader">
    <div className="blog-media-toolbar"><label className="button blog-upload-button" htmlFor="blog-attachments"><Upload size={15} />{busy ? 'Optimizing and uploading...' : 'Attach media'}</label><input id="blog-attachments" type="file" multiple accept={[...acceptedImages, ...acceptedFiles].join(',')} disabled={busy} onChange={(event) => { void upload(event.target.files); event.currentTarget.value = ''; }} /><small>Up to 20 attachments. Images accept 20 MB before optimization and store at 5 MB or less; documents remain 5 MB.</small></div>
    {error ? <p className="field-error" role="alert">{error}</p> : null}
    {value.length ? <ul className="blog-media-list">{value.map((item) => <li className="blog-media-item" key={item.id}>
      {item.kind === 'image' ? <Image src={item.url} alt={item.name} width={112} height={72} unoptimized /> : <span className="blog-file-icon" aria-hidden="true"><FileText size={22} /></span>}
      <div className="blog-media-item-copy"><strong>{item.name}</strong><span>{item.kind === 'image' ? 'Image' : 'Downloadable file'} · {Math.max(1, Math.round(item.sizeBytes / 1024))} KB</span></div>
      <button className="icon-button" type="button" disabled={busy} onClick={() => { void remove(item.id); }} aria-label={`Remove ${item.name}`}><Trash2 size={15} /></button>
    </li>)}</ul> : <div className="blog-media-empty"><ImageIcon size={18} /><span>No attachments yet. Add images to make the story more visual.</span></div>}
  </div>;
}
