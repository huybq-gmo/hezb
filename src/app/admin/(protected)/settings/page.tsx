import { SettingsEditor } from '@/components/admin/SettingsEditor';
import { getAdminSiteSettings } from '@/lib/queries/settings';

export const metadata = { title: 'Settings | Hezb', robots: { index: false, follow: false } };

export default async function AdminSettingsPage() {
  const settings = await getAdminSiteSettings();
  return <><div className="admin-topline"><div><p className="eyebrow">Workspace</p><h1>Settings</h1><p className="admin-page-intro">Manage the contact details shown on the public website.</p></div></div><SettingsEditor initial={settings} /></>;
}
