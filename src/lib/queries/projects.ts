import { getPublicClient } from '@/lib/supabase/public';
import { byLocale, localCategories, localProjectTranslations, localProjects } from '@/lib/data';
import type { Database, Locale } from '@/types/db';
import type { CategoryView, ProjectView } from '@/types/view-models';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type TranslationRow = Database['public']['Tables']['project_translations']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

function categoryView(row: CategoryRow | null, locale: Locale): CategoryView | null {
  return row ? { id: row.id, slug: row.slug, name: locale === 'en' ? row.name_en : row.name_vi, sortOrder: row.sort_order } : null;
}

function mergeProject(project: ProjectRow, translations: TranslationRow[], categories: CategoryRow[], locale: Locale): ProjectView {
  const translation = byLocale(translations, locale) ?? { project_id: project.id, locale, title: project.slug, summary: '', content: '', result: '' };
  const category = categories.find((item) => item.id === project.category_id) ?? null;
  return { id: project.id, slug: project.slug, category: categoryView(category, locale), clientName: project.client_name, year: project.year, tech: project.tech, coverUrl: project.cover_url, gallery: project.gallery, websiteUrl: project.website_url, isFeatured: project.is_featured, title: translation.title, summary: translation.summary, content: translation.content, result: translation.result, locale };
}

function localProjectsFor(locale: Locale, categorySlug?: string): ProjectView[] {
  return localProjects
    .filter((project) => project.is_published && (!categorySlug || localCategories.find((cat) => cat.id === project.category_id)?.slug === categorySlug))
    .sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at))
    .map((project) => mergeProject(project, localProjectTranslations.filter((row) => row.project_id === project.id), localCategories, locale));
}

async function remoteProjects(locale: Locale, categorySlug?: string): Promise<ProjectView[] | null> {
  const client = getPublicClient();
  if (!client) return null;
  let query = client.from('projects').select('*').eq('is_published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  const { data: projects, error } = await query;
  if (error || !projects) return null;
  const [translationResult, categoryResult] = await Promise.all([
    client.from('project_translations').select('*').in('project_id', projects.map((row) => row.id)),
    client.from('categories').select('*').order('sort_order', { ascending: true }),
  ]);
  if (translationResult.error || categoryResult.error) return null;
  const categories = categoryResult.data ?? [];
  return projects.map((project) => mergeProject(project, (translationResult.data ?? []).filter((row) => row.project_id === project.id), categories, locale)).filter((project) => !categorySlug || project.category?.slug === categorySlug);
}

export async function getProjects(locale: Locale, categorySlug?: string): Promise<ProjectView[]> {
  return (await remoteProjects(locale, categorySlug)) ?? localProjectsFor(locale, categorySlug);
}

export async function getFeaturedProjects(locale: Locale, limit = 3): Promise<ProjectView[]> {
  return (await getProjects(locale)).filter((project) => project.isFeatured).slice(0, limit);
}

export async function getProjectBySlug(slug: string, locale: Locale): Promise<ProjectView | null> {
  const project = (await getProjects(locale)).find((item) => item.slug === slug);
  return project ?? null;
}

export async function getPublishedSlugs(): Promise<string[]> {
  const client = getPublicClient();
  if (client) {
    const { data } = await client.from('projects').select('slug').eq('is_published', true);
    if (data) return data.map((row) => row.slug);
  }
  return localProjects.filter((project) => project.is_published).map((project) => project.slug);
}

export { mergeProject };
