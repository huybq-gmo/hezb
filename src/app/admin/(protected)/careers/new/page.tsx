import { JobEditor } from '@/components/admin/JobEditor';

export const metadata = { title: 'New role | Hezb', robots: { index: false, follow: false } };

export default function NewCareerPage() {
  return <><div className="admin-topline"><div><p className="eyebrow">People operations</p><h1>Add role</h1></div></div><JobEditor /></>;
}
