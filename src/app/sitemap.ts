import type { MetadataRoute } from 'next';
import { getPublishedBlogSlugs } from '@/lib/queries/blog';
import { getPublishedSlugs } from '@/lib/queries/projects';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/careers', '/projects', '/members', '/contact'];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of ['vi', 'en'] as const) {
    for (const route of staticRoutes) entries.push({ url: `${siteUrl}/${locale}${route}`, changeFrequency: route === '' ? 'weekly' : 'monthly', priority: route === '' ? 1 : .7 });
  }
  const [slugs, blogSlugs] = await Promise.all([getPublishedSlugs(), getPublishedBlogSlugs()]);
  for (const locale of ['vi', 'en'] as const) for (const slug of slugs) entries.push({ url: `${siteUrl}/${locale}/projects/${slug}`, changeFrequency: 'monthly', priority: .6 });
  for (const locale of ['vi', 'en'] as const) for (const slug of blogSlugs) entries.push({ url: `${siteUrl}/${locale}/blog/${slug}`, changeFrequency: 'monthly', priority: .6 });
  return entries;
}
