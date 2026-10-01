import Link from 'next/link';
import { getAdminMembers } from '@/lib/queries/members';
import { MemberTable } from '@/components/admin/MemberTable';

export const metadata = { title: 'Members | Hezb', robots: { index: false, follow: false } };

export default async function AdminMembersPage() {
  const members = await getAdminMembers('en');
  return <><div className="admin-topline"><div><p className="eyebrow">Content</p><h1>Members</h1></div><Link className="button button-primary button-small" href="/admin/members/new">Add member</Link></div><div className="admin-note">Published member profiles appear on the public team page. Translations remain editable in Supabase admin mode.</div><MemberTable members={members} /></>;
}
