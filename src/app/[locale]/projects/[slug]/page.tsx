import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getProjectBySlug, getPublishedSlugs } from '@/lib/queries/projects';
import { isLocale } from '@/i18n/routing';

export async function generateStaticParams() { const slugs = await getPublishedSlugs(); return ['vi', 'en'].flatMap((locale) => slugs.map((slug) => ({ locale, slug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params; if (!isLocale(rawLocale)) return {};
  const project = await getProjectBySlug(slug, rawLocale); if (!project) return {};
  return { title: project.title, description: project.summary, openGraph: { title: project.title, description: project.summary, images: project.coverUrl ? [project.coverUrl] : undefined } };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params; if (!isLocale(rawLocale)) notFound();
  const [project, messages] = await Promise.all([getProjectBySlug(slug, rawLocale), Promise.resolve(getMessages(rawLocale))]); if (!project) notFound();
  return <><section className="detail-hero"><div className="container"><Link className="breadcrumb" href={`/${rawLocale}/projects`}><ArrowLeft size={15} /> {messages.common.backProjects}</Link><div className="detail-cover">{project.coverUrl ? <Image src={project.coverUrl} alt="" fill sizes="100vw" unoptimized /> : null}<span>{project.title.slice(0, 1)}</span></div></div></section><section className="detail-layout container"><article><p className="eyebrow">{project.category?.name} {project.year ? `/ ${project.year}` : ''}</p><h1>{project.title}</h1><p className="detail-summary">{project.summary}</p><div className="prose"><ReactMarkdown skipHtml>{project.content}</ReactMarkdown></div><h2 style={{ marginTop: 36 }}>{messages.projects.result}</h2><p className="detail-summary">{project.result}</p>{project.gallery.length ? <><h2 style={{ marginTop: 36 }}>{messages.projects.gallery}</h2><div className="project-grid">{project.gallery.map((image) => <div className="detail-cover" style={{ height: 180 }} key={image}><Image src={image} alt="" fill sizes="(max-width: 680px) 100vw, 33vw" unoptimized /></div>)}</div></> : null}</article><aside className="detail-aside"><dl className="meta-list"><dt>{messages.projects.client}</dt><dd>{project.clientName ?? '-'}</dd><dt>{messages.projects.year}</dt><dd>{project.year ?? '-'}</dd><dt>{messages.projects.category}</dt><dd>{project.category?.name ?? '-'}</dd><dt>{messages.projects.tech}</dt><dd><div className="tech-list">{project.tech.map((tech) => <span key={tech}>{tech}</span>)}</div></dd></dl><Link className="button button-primary" href={`/${rawLocale}/contact`}>{messages.common.contact} <ArrowUpRight size={16} /></Link></aside></section></>;
}
