import { BlogEditor } from '@/components/admin/BlogEditor';

export const metadata = { title: 'New article | Hezb', robots: { index: false, follow: false } };

export default function NewBlogPage() {
  return <><div className="admin-topline"><div><p className="eyebrow">Editorial workspace</p><h1>New article</h1></div></div><BlogEditor /></>;
}
