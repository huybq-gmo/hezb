import Link from 'next/link';
import { Plus } from 'lucide-react';
import { BlogTable } from '@/components/admin/BlogTable';
import { getAdminBlogPosts } from '@/lib/queries/blog';

export const metadata = { title: 'Blog | Hezb', robots: { index: false, follow: false } };

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts('en');
  return <><div className="admin-topline"><div><p className="eyebrow">Editorial workspace</p><h1>Blog</h1><p className="admin-page-intro">Shape thoughtful stories, add supporting media and publish when the article is ready.</p></div><Link className="button button-primary button-small" href="/admin/blog/new"><Plus size={15} /> Add article</Link></div><div className="admin-note">Drafts stay private. Published articles appear in the public blog and sitemap.</div><BlogTable posts={posts} /></>;
}
