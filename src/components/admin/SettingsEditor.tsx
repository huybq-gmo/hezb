'use client';

import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveSiteSettings } from '@/lib/actions/settings';
import type { SiteSettingsInput } from '@/lib/validators/settings';

export function SettingsEditor({ initial }: { initial: SiteSettingsInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: SiteSettingsInput = {
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      addressVi: String(data.get('addressVi') ?? ''),
      addressEn: String(data.get('addressEn') ?? ''),
      responseTimeVi: String(data.get('responseTimeVi') ?? ''),
      responseTimeEn: String(data.get('responseTimeEn') ?? ''),
    };
    setError('');
    setSuccess(false);
    startTransition(async () => {
      const result = await saveSiteSettings(input);
      if (result.ok) {
        setSuccess(true);
        router.refresh();
      } else setError(result.message);
    });
  }

  return <form className="admin-form admin-editor" onSubmit={submit}>
    <div className="admin-form-layout">
      <div className="admin-form-main">
        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Contact channels</legend>
          <p className="admin-form-section-intro">These values are shown on the public contact page and mail links.</p>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="settings-email">Public email</label><input id="settings-email" name="email" type="email" defaultValue={initial.email} required /></div>
            <div className="form-field"><label htmlFor="settings-phone">Phone</label><input id="settings-phone" name="phone" type="tel" defaultValue={initial.phone} required /></div>
          </div>
        </fieldset>
        <fieldset className="form-panel admin-form-section">
          <legend className="admin-form-section-title">Localized details</legend>
          <p className="admin-form-section-intro">Keep the Vietnamese and English values aligned with the public language switcher.</p>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="settings-address-vi">Address (VI)</label><input id="settings-address-vi" name="addressVi" defaultValue={initial.addressVi} required /></div>
            <div className="form-field"><label htmlFor="settings-address-en">Address (EN)</label><input id="settings-address-en" name="addressEn" defaultValue={initial.addressEn} required /></div>
          </div>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="settings-response-vi">Response time (VI)</label><input id="settings-response-vi" name="responseTimeVi" defaultValue={initial.responseTimeVi} required /></div>
            <div className="form-field"><label htmlFor="settings-response-en">Response time (EN)</label><input id="settings-response-en" name="responseTimeEn" defaultValue={initial.responseTimeEn} required /></div>
          </div>
        </fieldset>
      </div>
      <aside className="admin-form-side">
        <div className="form-panel admin-form-publish">
          <p className="eyebrow">Publishing</p>
          <h2>Public contact details</h2>
          <p>Saving updates the Vietnamese and English contact pages after revalidation.</p>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          {success ? <p className="form-success" role="status">Contact details saved.</p> : null}
          <button className="button button-primary admin-submit" type="submit" disabled={pending}><Save size={16} />{pending ? 'Saving...' : 'Save contact details'}</button>
        </div>
      </aside>
    </div>
  </form>;
}
