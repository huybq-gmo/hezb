import { notFound } from 'next/navigation';
import { JobEditor } from '@/components/admin/JobEditor';
import { getAdminJobInput } from '@/lib/queries/careers';

export const metadata = { title: 'Edit role | Hezb', robots: { index: false, follow: false } };

export default async function EditCareerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initial = await getAdminJobInput(id);
  if (!initial) notFound();
  return <><div className="admin-topline"><div><p className="eyebrow">People operations</p><h1>Edit role</h1></div></div><JobEditor id={id} initial={initial} /></>;
}
