import { ProjectEditor } from '@/components/admin/ProjectEditor';

export const metadata = { title: 'New project | Hezb', robots: { index: false, follow: false } };

export default function NewProjectPage() { return <><div className="admin-topline"><div><p className="eyebrow">Content / Projects</p><h1>New project</h1></div></div><ProjectEditor /></>; }
