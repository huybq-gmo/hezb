import Link from 'next/link';
import { ProjectCard } from '@/components/site/ProjectCard';
import { getMessages } from '@/lib/i18n';
import { getCategories } from '@/lib/queries/categories';
import { getProjects } from '@/lib/queries/projects';
import { isLocale } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { localizedMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const messages = getMessages(rawLocale);
  return localizedMetadata(rawLocale, messages.projects.title, messages.projects.body, '/projects');
}

export default async function ProjectsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ cat?: string }> }) {
  const { locale: rawLocale } = await params; if (!isLocale(rawLocale)) notFound();
  const { cat } = await searchParams; const messages = getMessages(rawLocale);
  const [projects, categories] = await Promise.all([getProjects(rawLocale, cat), getCategories(rawLocale)]);
  return <><section className="page-hero"><div className="container"><p className="eyebrow">{messages.projects.eyebrow}</p><h1>{messages.projects.title}</h1><p>{messages.projects.body}</p></div></section><section className="section"><div className="container"><div className="filter-row"><Link className={`filter-link ${!cat ? 'active' : ''}`} href={`/${rawLocale}/projects`}>{messages.projects.all}</Link>{categories.map((category) => <Link className={`filter-link ${cat === category.slug ? 'active' : ''}`} href={`/${rawLocale}/projects?cat=${category.slug}`} key={category.id}>{category.name}</Link>)}</div>{projects.length ? <div className="project-grid">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <div className="empty-state">{messages.projects.empty}</div>}</div></section></>;
}
