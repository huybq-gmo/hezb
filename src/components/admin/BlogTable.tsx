'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUp, FileText, Pencil, Star, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteBlogPost, reorderBlogPost, toggleBlogPost } from '@/lib/actions/blog';
import type { BlogPostView } from '@/types/view-models';

export function BlogTable({ posts }: { posts: BlogPostView[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [pending, startTransition] = useTransition();
  const rows = posts.filter((post) => `${post.title} ${post.slug} ${post.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())).filter((post) => status === 'all' || (status === 'published' && post.isPublished) || (status === 'draft' && !post.isPublished));

  function run(action: Promise<{ ok: boolean }>) {
    startTransition(() => { void action.then(() => router.refresh()); });
  }

  return <>
    <div className="filter-row"><label className="sr-only" htmlFor="blog-search">Search articles</label><input id="blog-search" className="admin-filter-input" placeholder="Search articles" value={search} onChange={(event) => setSearch(event.target.value)} /><label className="sr-only" htmlFor="blog-status">Filter article status</label><select id="blog-status" className="filter-link" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></div>
    <div className="admin-table-wrap"><table className="admin-table"><caption className="sr-only">Blog articles</caption><thead><tr><th>Article</th><th>Tags</th><th>Media</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead><tbody>{rows.map((post) => <tr key={post.id}><td><strong>{post.title}</strong><br /><span style={{ color: 'var(--muted)' }}>{post.slug}</span></td><td><div className="table-tags">{post.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div></td><td><span className="table-media-count"><FileText size={14} /> {post.attachments.length}</span></td><td><button className={`status-pill ${post.isPublished ? '' : 'draft'}`} type="button" disabled={pending} onClick={() => run(toggleBlogPost(post.id, 'is_published', !post.isPublished))}>{post.isPublished ? 'Published' : 'Draft'}</button></td><td><button className="icon-button" type="button" aria-label={`Move ${post.title} up`} disabled={pending} onClick={() => run(reorderBlogPost(post.id, 'up'))}><ArrowUp size={14} /></button><button className="icon-button" type="button" aria-label={`Move ${post.title} down`} disabled={pending} onClick={() => run(reorderBlogPost(post.id, 'down'))}><ArrowDown size={14} /></button></td><td><div className="admin-actions"><button className="icon-button" type="button" disabled={pending} aria-label={`${post.isFeatured ? 'Remove' : 'Mark'} ${post.title} as featured`} onClick={() => run(toggleBlogPost(post.id, 'is_featured', !post.isFeatured))}><Star size={15} fill={post.isFeatured ? 'currentColor' : 'none'} /></button><Link className="button" href={`/admin/blog/${post.id}`} aria-label={`Edit ${post.title}`}><Pencil size={14} /></Link>{post.isPublished ? <Link className="button" href={`/vi/blog/${post.slug}`} target="_blank" aria-label={`Open ${post.title}`}><FileText size={14} /></Link> : null}<button className="button" type="button" disabled={pending} aria-label={`Delete ${post.title}`} onClick={() => { if (window.confirm('Delete this article and its attachments?')) run(deleteBlogPost(post.id)); }}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>
  </>;
}
