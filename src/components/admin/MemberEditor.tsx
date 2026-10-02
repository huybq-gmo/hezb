'use client';

import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveMember } from '@/lib/actions/members';
import { ImageUploader } from './ImageUploader';
import type { MemberInput } from '@/lib/validators/member';

export function MemberEditor({ id, initial }: { id?: string; initial?: MemberInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? '');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError('');
    startTransition(async () => {
      const result = await saveMember({
        slug: String(data.get('slug') ?? ''),
        nameVi: String(data.get('nameVi') ?? ''),
        nameEn: String(data.get('nameEn') ?? ''),
        roleVi: String(data.get('roleVi') ?? ''),
        roleEn: String(data.get('roleEn') ?? ''),
        bioVi: String(data.get('bioVi') ?? ''),
        bioEn: String(data.get('bioEn') ?? ''),
        linkedinUrl: String(data.get('linkedin') ?? ''),
        avatarUrl,
        isPublished: data.get('published') === 'on',
      }, id);
      if (result.ok) router.push('/admin/members');
      else setError(result.message);
    });
  }

  return <form className="admin-form admin-editor" onSubmit={submit}>
    <div className="admin-form-layout">
      <div className="admin-form-main">
        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Profile content</legend>
          <p className="admin-form-section-intro">Keep the profile consistent in both languages so the community page feels complete.</p>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="member-name-vi">Name (VI)</label><input id="member-name-vi" name="nameVi" defaultValue={initial?.nameVi} required /></div>
            <div className="form-field"><label htmlFor="member-name-en">Name (EN)</label><input id="member-name-en" name="nameEn" defaultValue={initial?.nameEn} required /></div>
          </div>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="member-role-vi">Role (VI)</label><input id="member-role-vi" name="roleVi" defaultValue={initial?.roleVi} required /></div>
            <div className="form-field"><label htmlFor="member-role-en">Role (EN)</label><input id="member-role-en" name="roleEn" defaultValue={initial?.roleEn} required /></div>
          </div>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="member-bio-vi">Bio (VI)</label><textarea id="member-bio-vi" name="bioVi" defaultValue={initial?.bioVi} rows={6} /></div>
            <div className="form-field"><label htmlFor="member-bio-en">Bio (EN)</label><textarea id="member-bio-en" name="bioEn" defaultValue={initial?.bioEn} rows={6} /></div>
          </div>
        </fieldset>
        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Profile details</legend>
          <p className="admin-form-section-intro">The slug becomes the stable internal identifier for this profile.</p>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="member-slug">Slug</label><input id="member-slug" name="slug" defaultValue={initial?.slug} placeholder="your-name" required /></div>
            <div className="form-field"><label htmlFor="member-linkedin">LinkedIn URL</label><input id="member-linkedin" name="linkedin" defaultValue={initial?.linkedinUrl} type="url" placeholder="https://linkedin.com/in/..." /></div>
          </div>
        </fieldset>
        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Profile image</legend>
          <p className="admin-form-section-intro">Use a clear portrait or a transparent illustration. Images are limited to 5 MB.</p>
          <ImageUploader bucket="member-media" label="Avatar" value={avatarUrl} onUploaded={setAvatarUrl} />
          <input type="hidden" name="avatarUrl" value={avatarUrl} />
        </fieldset>
      </div>
      <aside className="admin-form-side">
        <div className="form-panel admin-form-publish">
          <p className="eyebrow">Publishing</p>
          <h2>{id ? 'Update member' : 'Create member'}</h2>
          <p>Published profiles appear on the public community page.</p>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <div className="admin-checks"><label className="admin-check"><input type="checkbox" name="published" defaultChecked={initial?.isPublished} /> Published profile</label></div>
          <button className="button button-primary admin-submit" type="submit" disabled={pending}><Save size={16} />{pending ? 'Saving...' : 'Save member'}</button>
        </div>
      </aside>
    </div>
  </form>;
}
