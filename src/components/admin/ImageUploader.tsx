'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { maxImageSourceBytes, maxImageStoredBytes, optimizeImage } from '@/lib/image-optimization';
import { getBrowserClient } from '@/lib/supabase/browser';
import { storagePathsFromPublicUrls } from '@/lib/storage';

const accepted = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function ImageUploader({ bucket, label = 'Image', value = '', persistedValue = '', onUploaded }: { bucket: 'project-media' | 'member-media' | 'blog-media'; label?: string; value?: string; persistedValue?: string; onUploaded: (url: string) => void }) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setError(''); if (!accepted.includes(file.type)) { setError('Use JPEG, PNG, WebP or AVIF.'); return; } if (file.size > maxImageSourceBytes) { setError('Images must be 20 MB or smaller before optimization.'); return; }
    setBusy(true);
    try {
      const optimized = await optimizeImage(file);
      if (optimized.size > maxImageStoredBytes) throw new Error('This image is still larger than 5 MB after optimization.');
      const client = getBrowserClient();
      if (!client) { onUploaded(URL.createObjectURL(optimized)); return; }
      const folder = bucket === 'project-media' ? 'projects' : bucket === 'member-media' ? 'members' : 'posts';
      const path = `${folder}/${crypto.randomUUID()}-${optimized.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const result = await client.storage.from(bucket).upload(path, optimized, { contentType: optimized.type, upsert: false });
      if (result.error) throw new Error(result.error.message.includes('Bucket not found') ? 'Storage bucket is missing. Apply the Supabase migrations before uploading media.' : result.error.message);
      const { data } = client.storage.from(bucket).getPublicUrl(path);
      onUploaded(data.publicUrl);
      if (value && value !== persistedValue) {
        const previousPaths = storagePathsFromPublicUrls([value], bucket);
        if (previousPaths.length) {
          const cleanup = await client.storage.from(bucket).remove(previousPaths);
          if (cleanup.error) setError('The new image was uploaded, but the previous image could not be removed.');
        }
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload this image.');
    } finally { setBusy(false); }
  }
  async function remove() {
    if (!value) return;
    const client = getBrowserClient();
    setBusy(true); setError('');
    try {
      if (client && value !== persistedValue) { const paths = storagePathsFromPublicUrls([value], bucket); if (paths.length) { const result = await client.storage.from(bucket).remove(paths); if (result.error) throw new Error(result.error.message); } }
      onUploaded('');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'The image could not be removed.');
    } finally { setBusy(false); }
  }
  return <div className="image-uploader">{value ? <div className="image-uploader-preview" style={{ backgroundImage: `url(${value})` }} aria-label="Current uploaded image" role="img" /> : null}<div className="image-uploader-actions"><label htmlFor={`${bucket}-upload`}>{label}</label>{value ? <button className="icon-button" type="button" onClick={() => { void remove(); }} aria-label="Remove image" title="Remove image"><Trash2 size={15} /></button> : null}</div><input id={`${bucket}-upload`} type="file" accept={accepted.join(',')} disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />{error ? <p className="field-error">{error}</p> : null}<small>{busy ? 'Optimizing and uploading...' : 'JPEG, PNG, WebP or AVIF, up to 20 MB before optimization; stored at 5 MB or less.'}</small></div>;
}
