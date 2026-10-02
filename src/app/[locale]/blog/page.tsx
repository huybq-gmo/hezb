import type { Metadata } from 'next';
import { BlogCard } from '@/components/site/BlogCard';
import { getMessages } from '@/lib/i18n';
import { getBlogPosts } from '@/lib/queries/blog';
import { isLocale } from '@/i18n/routing';
import { localizedMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const messages = getMessages(rawLocale);
  return localizedMetadata(rawLocale, messages.blog.title, messages.blog.body, '/blog');
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const [messages, posts] = await Promise.all([Promise.resolve(getMessages(rawLocale)), getBlogPosts(rawLocale)]);
  const featured = posts.find((post) => post.isFeatured);
  const remaining = featured ? posts.filter((post) => post.id !== featured.id) : posts;
  return <><section className="page-hero"><div className="container"><p className="eyebrow">{messages.blog.eyebrow}</p><h1>{messages.blog.title}</h1><p>{messages.blog.body}</p></div></section><section className="section"><div className="container">{featured ? <div className="blog-featured"><BlogCard post={featured} messages={messages} /><div className="blog-featured-note"><p className="eyebrow">{messages.blog.featured}</p><p>{featured.excerpt}</p></div></div> : null}{remaining.length ? <div className="blog-grid">{remaining.map((post) => <BlogCard key={post.id} post={post} messages={messages} />)}</div> : !featured ? <div className="empty-state">{messages.blog.noPosts}</div> : null}</div></section></>;
}
