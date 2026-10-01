import { notFound } from 'next/navigation';
import { ProjectEditor } from '@/components/admin/ProjectEditor';
import { getAdminProjectInput } from '@/lib/queries/projects';

export const metadata = { title: 'Edit project | Hezb', robots: { index: false, follow: false } };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initial = await getAdminProjectInput(id);
  if (!initial) notFound();
  return <><div className="admin-topline"><div><p className="eyebrow">Content / Projects</p><h1>Edit project</h1></div></div><ProjectEditor id={id} initial={initial} /></>;
}
