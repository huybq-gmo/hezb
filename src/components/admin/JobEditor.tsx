'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveJob } from '@/lib/actions/careers';
import type { JobInput } from '@/lib/validators/career';

export function JobEditor({ id, initial }: { id?: string; initial?: JobInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: JobInput = {
      slug: String(data.get('slug') ?? ''),
      employmentType: String(data.get('employmentType') ?? 'full_time') as JobInput['employmentType'],
      location: String(data.get('location') ?? ''),
      isRemote: data.get('remote') === 'on',
      titleVi: String(data.get('titleVi') ?? ''),
      titleEn: String(data.get('titleEn') ?? ''),
      summaryVi: String(data.get('summaryVi') ?? ''),
      summaryEn: String(data.get('summaryEn') ?? ''),
      descriptionVi: String(data.get('descriptionVi') ?? ''),
      descriptionEn: String(data.get('descriptionEn') ?? ''),
      requirementsVi: String(data.get('requirementsVi') ?? ''),
      requirementsEn: String(data.get('requirementsEn') ?? ''),
      isPublished: data.get('published') === 'on',
    };
    setError('');
    startTransition(async () => {
      const result = await saveJob(input, id);
      if (result.ok) router.push('/admin/careers');
      else setError(result.message);
    });
  }

  return <form className="admin-form" onSubmit={submit}><div className="form-panel"><p className="eyebrow">Career editor</p>{error ? <p className="field-error" role="alert">{error}</p> : null}
    <div className="form-grid"><div className="form-field"><label htmlFor="job-title-vi">Title (VI)</label><input id="job-title-vi" name="titleVi" defaultValue={initial?.titleVi} required /></div><div className="form-field"><label htmlFor="job-title-en">Title (EN)</label><input id="job-title-en" name="titleEn" defaultValue={initial?.titleEn} required /></div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="job-summary-vi">Summary (VI)</label><textarea id="job-summary-vi" name="summaryVi" defaultValue={initial?.summaryVi} rows={3} required /></div><div className="form-field"><label htmlFor="job-summary-en">Summary (EN)</label><textarea id="job-summary-en" name="summaryEn" defaultValue={initial?.summaryEn} rows={3} required /></div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="job-slug">Slug</label><input id="job-slug" name="slug" defaultValue={initial?.slug} placeholder="ai-product-engineer" required /></div><div className="form-field"><label htmlFor="job-type">Engagement type</label><select id="job-type" name="employmentType" defaultValue={initial?.employmentType ?? 'full_time'}><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="job-location">Location</label><input id="job-location" name="location" defaultValue={initial?.location ?? 'Ho Chi Minh City / Remote'} required /></div><div className="form-field"><label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginTop: 31 }}><input type="checkbox" name="remote" defaultChecked={initial?.isRemote} /> Remote-friendly</label></div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="job-description-vi">Description (VI)</label><textarea id="job-description-vi" name="descriptionVi" defaultValue={initial?.descriptionVi} rows={7} /></div><div className="form-field"><label htmlFor="job-description-en">Description (EN)</label><textarea id="job-description-en" name="descriptionEn" defaultValue={initial?.descriptionEn} rows={7} /></div></div>
    <div className="form-grid"><div className="form-field"><label htmlFor="job-requirements-vi">Requirements (VI)</label><textarea id="job-requirements-vi" name="requirementsVi" defaultValue={initial?.requirementsVi} rows={7} placeholder="One requirement per line" /></div><div className="form-field"><label htmlFor="job-requirements-en">Requirements (EN)</label><textarea id="job-requirements-en" name="requirementsEn" defaultValue={initial?.requirementsEn} rows={7} placeholder="One requirement per line" /></div></div>
    <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="published" defaultChecked={initial?.isPublished} /> Published</label><div style={{ marginTop: 23 }}><button className="button button-primary" type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save role'}</button></div>
  </div></form>;
}
