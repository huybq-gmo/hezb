import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Messages } from '@/lib/i18n';
import type { BlogPostView } from '@/types/view-models';

export function BlogCard({ post, messages }: { post: BlogPostView; messages: Messages }) {
  const minutes = Math.max(1, Math.ceil(post.content.split(/\s+/).filter(Boolean).length / 180));
  return <Link className="blog-card" href={`/${post.locale}/blog/${post.slug}`}>
    <div className="blog-card-visual">{post.coverUrl ? <Image src={post.coverUrl} alt={`${post.title} cover`} fill sizes="(max-width: 720px) 100vw, 33vw" unoptimized={post.coverUrl.startsWith('http')} /> : <span aria-hidden="true">{post.title.slice(0, 1)}</span>}<span className="visual-arrow"><ArrowUpRight size={19} /></span></div>
    <div className="blog-card-copy"><div className="card-kicker"><span>{post.tags[0] ?? 'Hezb'}</span><span>{minutes} {messages.blog.readTime}</span></div><h2>{post.title}</h2><p>{post.excerpt}</p><span className="inline-link">{messages.blog.readArticle} <ArrowUpRight size={15} /></span></div>
  </Link>;
}
