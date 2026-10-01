'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveProject } from '@/lib/actions/projects';
import type { ProjectInput } from '@/lib/validators/project';
import { ImageUploader } from './ImageUploader';

export function ProjectEditor({ id, initial }: { id?: string; initial?: ProjectInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? '');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const list = String(data.get('tech') ?? '').split(',').map((value) => value.trim()).filter(Boolean);
    startTransition(async () => {
      const result = await saveProject({
        slug: String(data.get('slug') ?? ''),
        categorySlug: String(data.get('category') ?? 'ai'),
        clientName: String(data.get('client') ?? ''),
        year: Number(data.get('year') ?? new Date().getFullYear()),
        tech: list,
        coverUrl,
        websiteUrl: String(data.get('website') ?? ''),
        titleVi: String(data.get('titleVi') ?? ''),
        titleEn: String(data.get('titleEn') ?? ''),
        summaryVi: String(data.get('summaryVi') ?? ''),
        summaryEn: String(data.get('summaryEn') ?? ''),
        contentVi: String(data.get('contentVi') ?? ''),
        contentEn: String(data.get('contentEn') ?? ''),
        resultVi: String(data.get('resultVi') ?? ''),
        resultEn: String(data.get('resultEn') ?? ''),
        isPublished: data.get('published') === 'on',
        isFeatured: data.get('featured') === 'on',
      }, id);
      if (result.ok) router.push('/admin/projects');
      else setError(result.message);
    });
  }

  return <form className="admin-form" onSubmit={submit}><div className="form-panel"><p className="eyebrow">Project editor</p>{error ? <p className="field-error" role="alert">{error}</p> : null}
    <div className="form-grid"><div className="form-field"><label htmlFor="project-title-vi">Title (VI)</label><input id="project-title-vi" name="titleVi" defaultValue={initial?.titleVi} required /></div><div className="form-field"><label htmlFor="project-title-en">Title (EN)</label><input id="project-title-en" name="titleEn" defaultValue={initial?.titleEn} required /></div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="project-summary-vi">Summary (VI)</label><textarea id="project-summary-vi" name="summaryVi" defaultValue={initial?.summaryVi} rows={3} required /></div><div className="form-field"><label htmlFor="project-summary-en">Summary (EN)</label><textarea id="project-summary-en" name="summaryEn" defaultValue={initial?.summaryEn} rows={3} required /></div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="project-slug">Slug</label><input id="project-slug" name="slug" defaultValue={initial?.slug} placeholder="my-project" required /></div><div className="form-field"><label htmlFor="project-client">Client</label><input id="project-client" name="client" defaultValue={initial?.clientName} /></div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="project-category">Category</label><select id="project-category" name="category" defaultValue={initial?.categorySlug ?? 'ai'}><option value="ai">AI</option><option value="custom-software">Custom software</option><option value="automation">Automation</option></select></div><div className="form-field"><label htmlFor="project-year">Year</label><input id="project-year" name="year" type="number" defaultValue={initial?.year ?? new Date().getFullYear()} min={2000} max={2100} /></div></div>
    <div className="form-field"><label htmlFor="project-tech">Tech stack (comma separated)</label><input id="project-tech" name="tech" defaultValue={initial?.tech.join(', ')} placeholder="TypeScript, Supabase" /></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="project-content-vi">Content (VI, Markdown)</label><textarea id="project-content-vi" name="contentVi" defaultValue={initial?.contentVi} rows={6} /></div><div className="form-field"><label htmlFor="project-content-en">Content (EN, Markdown)</label><textarea id="project-content-en" name="contentEn" defaultValue={initial?.contentEn} rows={6} /></div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="project-result-vi">Result (VI)</label><input id="project-result-vi" name="resultVi" defaultValue={initial?.resultVi} /></div><div className="form-field"><label htmlFor="project-result-en">Result (EN)</label><input id="project-result-en" name="resultEn" defaultValue={initial?.resultEn} /></div></div>
    <div className="form-grid"><div className="form-field"><ImageUploader bucket="project-media" onUploaded={setCoverUrl} /><input type="hidden" name="coverUrl" value={coverUrl} /></div><div className="form-field"><label htmlFor="project-website">Website URL</label><input id="project-website" name="website" defaultValue={initial?.websiteUrl} type="url" placeholder="https://" /></div></div>
    <label style={{ display: 'inline-flex', gap: 8, marginRight: 20, alignItems: 'center' }}><input type="checkbox" name="published" defaultChecked={initial?.isPublished} /> Published</label><label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="featured" defaultChecked={initial?.isFeatured} /> Featured</label><div style={{ marginTop: 23 }}><button className="button button-primary" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save project'}</button></div>
  </div></form>;
}
