import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getBlogPostBySlug, getPublishedBlogSlugs } from '@/lib/queries/blog';
import { isLocale } from '@/i18n/routing';
import { localizedMetadata, socialPreviewImage } from '@/lib/seo';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPublishedBlogSlugs();
  return ['vi', 'en'].flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const post = await getBlogPostBySlug(slug, rawLocale);
  if (!post) return {};
  const previewImage = post.coverUrl ? { url: post.coverUrl, alt: `${post.title} cover` } : socialPreviewImage;
  return {
    ...localizedMetadata(rawLocale, post.seoTitle || post.title, post.seoDescription || post.excerpt, `/blog/${slug}`),
    openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, type: 'article', url: `/${rawLocale}/blog/${slug}`, siteName: 'Hezb Community', images: [previewImage] },
    twitter: { card: 'summary_large_image', title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, images: [previewImage.url] },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const [post, messages] = await Promise.all([getBlogPostBySlug(slug, rawLocale), Promise.resolve(getMessages(rawLocale))]);
  if (!post) notFound();
  const minutes = Math.max(1, Math.ceil(post.content.split(/\s+/).filter(Boolean).length / 180));
  const images = post.attachments.filter((attachment) => attachment.kind === 'image');
  const files = post.attachments.filter((attachment) => attachment.kind === 'file');
  return <><section className="detail-hero blog-detail-hero"><div className="container"><Link className="breadcrumb" href={`/${rawLocale}/blog`}><ArrowLeft size={15} /> {messages.blog.back}</Link><div className="blog-detail-heading"><p className="eyebrow">{post.tags[0] ?? messages.blog.eyebrow}</p><h1>{post.title}</h1><p className="detail-summary">{post.excerpt}</p><p className="blog-byline">{messages.blog.by} {post.authorName} · {minutes} {messages.blog.readTime}</p></div>{post.coverUrl ? <div className="detail-cover blog-cover"><Image src={post.coverUrl} alt={`${post.title} cover`} fill sizes="100vw" unoptimized={post.coverUrl.startsWith('http')} /></div> : null}</div></section><section className="detail-layout blog-detail-layout container"><article><div className="prose"><ReactMarkdown skipHtml>{post.content}</ReactMarkdown></div>{images.length ? <section className="blog-attachments"><h2>{messages.blog.attachments}</h2><div className="blog-gallery">{images.map((image) => <a href={image.url} target="_blank" rel="noreferrer" key={image.id}><Image src={image.url} alt={image.name} width={900} height={600} unoptimized={image.url.startsWith('http')} /><span>{image.name}</span></a>)}</div></section> : null}{files.length ? <section className="blog-files"><h2>{messages.blog.attachments}</h2>{files.map((file) => <a className="blog-file-link" href={file.url} target="_blank" rel="noreferrer" download key={file.id}><Download size={16} />{file.name}</a>)}</section> : null}</article><aside className="detail-aside"><p className="eyebrow">{messages.blog.eyebrow}</p><div className="tag-list">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><Link className="button button-primary" href={`/${rawLocale}/contact`}>{messages.common.contact}</Link></aside></section></>;
}
