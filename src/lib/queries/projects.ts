import { getPublicClient } from '@/lib/supabase/public';
import { getServerClient } from '@/lib/supabase/server';
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
  const translation = byLocale(translations, locale);
  const fallback = byLocale(translations, 'vi');
  const category = categories.find((item) => item.id === project.category_id) ?? null;
  return {
    id: project.id,
    slug: project.slug,
    category: categoryView(category, locale),
    clientName: project.client_name,
    year: project.year,
    tech: project.tech,
    coverUrl: project.cover_url,
    gallery: project.gallery,
    websiteUrl: project.website_url,
    isPublished: project.is_published,
    isFeatured: project.is_featured,
    title: translation?.title?.trim() || fallback?.title?.trim() || project.slug,
    summary: translation?.summary?.trim() || fallback?.summary?.trim() || '',
    content: translation?.content?.trim() || fallback?.content?.trim() || '',
    result: translation?.result?.trim() || fallback?.result?.trim() || '',
    locale,
  };
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
  const query = client.from('projects').select('*').eq('is_published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
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

export async function getAdminProjects(locale: Locale): Promise<ProjectView[]> {
  const client = await getServerClient();
  if (client) {
    const [projectsResult, translationsResult, categoriesResult] = await Promise.all([
      client.from('projects').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      client.from('project_translations').select('*'),
      client.from('categories').select('*').order('sort_order', { ascending: true }),
    ]);
    if (!projectsResult.error && !translationsResult.error && !categoriesResult.error && projectsResult.data) {
      return projectsResult.data.map((project) => mergeProject(
        project,
        (translationsResult.data ?? []).filter((row) => row.project_id === project.id),
        categoriesResult.data ?? [],
        locale,
      ));
    }
  }
  return localProjects
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((project) => mergeProject(project, localProjectTranslations.filter((row) => row.project_id === project.id), localCategories, locale));
}

export async function getAdminProjectInput(id: string) {
  const client = await getServerClient();
  if (client) {
    const [projectResult, translationsResult, categoriesResult] = await Promise.all([
      client.from('projects').select('*').eq('id', id).maybeSingle(),
      client.from('project_translations').select('*').eq('project_id', id),
      client.from('categories').select('id, slug'),
    ]);
    if (!projectResult.error && !translationsResult.error && !categoriesResult.error && projectResult.data) {
      const vi = translationsResult.data.find((row) => row.locale === 'vi');
      const en = translationsResult.data.find((row) => row.locale === 'en');
      if (vi && en) return { slug: projectResult.data.slug, categorySlug: categoriesResult.data.find((category) => category.id === projectResult.data?.category_id)?.slug ?? 'ai', clientName: projectResult.data.client_name ?? '', year: projectResult.data.year ?? new Date().getFullYear(), tech: projectResult.data.tech, coverUrl: projectResult.data.cover_url ?? '', websiteUrl: projectResult.data.website_url ?? '', titleVi: vi.title, titleEn: en.title, summaryVi: vi.summary, summaryEn: en.summary, contentVi: vi.content, contentEn: en.content, resultVi: vi.result, resultEn: en.result, isPublished: projectResult.data.is_published, isFeatured: projectResult.data.is_featured };
    }
  }
  const project = localProjects.find((item) => item.id === id);
  if (!project) return null;
  const vi = localProjectTranslations.find((row) => row.project_id === id && row.locale === 'vi');
  const en = localProjectTranslations.find((row) => row.project_id === id && row.locale === 'en');
  const category = localCategories.find((item) => item.id === project.category_id);
  if (!vi || !en || !category) return null;
  return { slug: project.slug, categorySlug: category.slug, clientName: project.client_name ?? '', year: project.year ?? new Date().getFullYear(), tech: project.tech, coverUrl: project.cover_url ?? '', websiteUrl: project.website_url ?? '', titleVi: vi.title, titleEn: en.title, summaryVi: vi.summary, summaryEn: en.summary, contentVi: vi.content, contentEn: en.content, resultVi: vi.result, resultEn: en.result, isPublished: project.is_published, isFeatured: project.is_featured };
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
