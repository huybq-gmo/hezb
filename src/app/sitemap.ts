import type { MetadataRoute } from 'next';
import { getPublishedSlugs } from '@/lib/queries/projects';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/careers', '/projects', '/members', '/contact'];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of ['vi', 'en'] as const) {
    for (const route of staticRoutes) entries.push({ url: `${siteUrl}/${locale}${route}`, changeFrequency: route === '' ? 'weekly' : 'monthly', priority: route === '' ? 1 : .7 });
  }
  const slugs = await getPublishedSlugs();
  for (const locale of ['vi', 'en'] as const) for (const slug of slugs) entries.push({ url: `${siteUrl}/${locale}/projects/${slug}`, changeFrequency: 'monthly', priority: .6 });
  return entries;
}
