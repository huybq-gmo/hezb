'use client';

import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
    setError('');
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

  return <form className="admin-form admin-editor" onSubmit={submit}>
    <div className="admin-form-layout">
      <div className="admin-form-main">
        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Project content</legend>
          <p className="admin-form-section-intro">Write both language versions so every visitor gets a complete project story.</p>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="project-title-vi">Title (VI)</label><input id="project-title-vi" name="titleVi" defaultValue={initial?.titleVi} required /></div>
            <div className="form-field"><label htmlFor="project-title-en">Title (EN)</label><input id="project-title-en" name="titleEn" defaultValue={initial?.titleEn} required /></div>
          </div>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="project-summary-vi">Summary (VI)</label><textarea id="project-summary-vi" name="summaryVi" defaultValue={initial?.summaryVi} rows={3} required /></div>
            <div className="form-field"><label htmlFor="project-summary-en">Summary (EN)</label><textarea id="project-summary-en" name="summaryEn" defaultValue={initial?.summaryEn} rows={3} required /></div>
          </div>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="project-content-vi">Content (VI, Markdown)</label><textarea id="project-content-vi" name="contentVi" defaultValue={initial?.contentVi} rows={8} /></div>
            <div className="form-field"><label htmlFor="project-content-en">Content (EN, Markdown)</label><textarea id="project-content-en" name="contentEn" defaultValue={initial?.contentEn} rows={8} /></div>
          </div>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="project-result-vi">Result (VI)</label><input id="project-result-vi" name="resultVi" defaultValue={initial?.resultVi} /></div>
            <div className="form-field"><label htmlFor="project-result-en">Result (EN)</label><input id="project-result-en" name="resultEn" defaultValue={initial?.resultEn} /></div>
          </div>
        </fieldset>
        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Project details</legend>
          <p className="admin-form-section-intro">Use a stable slug and keep the supporting metadata concise.</p>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="project-slug">Slug</label><input id="project-slug" name="slug" defaultValue={initial?.slug} placeholder="my-project" required /></div>
            <div className="form-field"><label htmlFor="project-client">Client</label><input id="project-client" name="client" defaultValue={initial?.clientName} /></div>
          </div>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="project-category">Category</label><select id="project-category" name="category" defaultValue={initial?.categorySlug ?? 'ai'}><option value="ai">AI</option><option value="custom-software">Custom software</option><option value="automation">Automation</option></select></div>
            <div className="form-field"><label htmlFor="project-year">Year</label><input id="project-year" name="year" type="number" defaultValue={initial?.year ?? new Date().getFullYear()} min={2000} max={2100} /></div>
          </div>
          <div className="form-field"><label htmlFor="project-tech">Tech stack</label><input id="project-tech" name="tech" defaultValue={initial?.tech.join(', ')} placeholder="TypeScript, Supabase, AI" /><small className="field-hint">Separate technologies with commas.</small></div>
          <div className="form-field"><label htmlFor="project-website">Website URL</label><input id="project-website" name="website" defaultValue={initial?.websiteUrl} type="url" placeholder="https://" /></div>
        </fieldset>
        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Cover media</legend>
          <p className="admin-form-section-intro">A clear cover image gives the project grid a strong visual anchor.</p>
          <ImageUploader bucket="project-media" label="Cover image" value={coverUrl} onUploaded={setCoverUrl} />
          <input type="hidden" name="coverUrl" value={coverUrl} />
        </fieldset>
      </div>
      <aside className="admin-form-side">
        <div className="form-panel admin-form-publish">
          <p className="eyebrow">Publishing</p>
          <h2>{id ? 'Update project' : 'Create project'}</h2>
          <p>Save as a draft while content is in progress, or publish it to the public projects page.</p>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <div className="admin-checks">
            <label className="admin-check"><input type="checkbox" name="published" defaultChecked={initial?.isPublished} /> Published</label>
            <label className="admin-check"><input type="checkbox" name="featured" defaultChecked={initial?.isFeatured} /> Featured project</label>
          </div>
          <button className="button button-primary admin-submit" type="submit" disabled={pending}><Save size={16} />{pending ? 'Saving...' : 'Save project'}</button>
        </div>
      </aside>
    </div>
  </form>;
}
