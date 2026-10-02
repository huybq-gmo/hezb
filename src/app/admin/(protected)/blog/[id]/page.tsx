import { notFound } from 'next/navigation';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { getAdminBlogPostInput } from '@/lib/queries/blog';

export const metadata = { title: 'Edit article | Hezb', robots: { index: false, follow: false } };

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initial = await getAdminBlogPostInput(id);
  if (!initial) notFound();
  return <><div className="admin-topline"><div><p className="eyebrow">Editorial workspace</p><h1>Edit article</h1></div></div><BlogEditor id={id} initial={initial} /></>;
}
