import { notFound } from 'next/navigation';
import { MemberEditor } from '@/components/admin/MemberEditor';
import { getAdminMemberInput } from '@/lib/queries/members';

export const metadata = { title: 'Edit member | Hezb', robots: { index: false, follow: false } };

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initial = await getAdminMemberInput(id);
  if (!initial) notFound();
  return <><div className="admin-topline"><div><p className="eyebrow">Content / Members</p><h1>Edit member</h1></div></div><MemberEditor id={id} initial={initial} /></>;
}
