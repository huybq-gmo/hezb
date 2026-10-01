import { MemberEditor } from '@/components/admin/MemberEditor';

export const metadata = { title: 'New member | Hezb', robots: { index: false, follow: false } };

export default function NewMemberPage() { return <><div className="admin-topline"><div><p className="eyebrow">Content / Members</p><h1>New member</h1></div></div><MemberEditor /></>; }
