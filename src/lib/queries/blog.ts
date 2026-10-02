import { getPublicClient } from '@/lib/supabase/public';
import { getServerClient } from '@/lib/supabase/server';
import { localBlogAttachments, localBlogPosts, localBlogTranslations } from '@/lib/blog-data';
import { byLocale } from '@/lib/data';
import type { Database, Locale } from '@/types/db';
import type { BlogPostView } from '@/types/view-models';
import type { BlogInput } from '@/lib/validators/blog';

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];
type BlogTranslationRow = Database['public']['Tables']['blog_post_translations']['Row'];
type BlogAttachmentRow = Database['public']['Tables']['blog_post_attachments']['Row'];

const publicPostFields = 'id, slug, author_name, cover_url, tags, is_published, is_featured, sort_order, published_at, created_at, updated_at';
const publicTranslationFields = 'post_id, locale, title, excerpt, content, seo_title, seo_description';
const publicAttachmentFields = 'id, post_id, kind, name, url, content_type, size_bytes, sort_order, created_at';

function cleanSeoTitle(value: string): string {
  return value.replace(/\s*\|\s*Hezb\s*$/i, '').trim();
}

function mergeBlogPost(post: BlogPostRow, translations: BlogTranslationRow[], attachments: BlogAttachmentRow[], locale: Locale): BlogPostView {
  const translation = byLocale(translations, locale);
  const fallback = byLocale(translations, 'vi');
  return {
    id: post.id,
    slug: post.slug,
    authorName: post.author_name,
    coverUrl: post.cover_url,
    tags: post.tags,
    isPublished: post.is_published,
    isFeatured: post.is_featured,
    sortOrder: post.sort_order,
    publishedAt: post.published_at,
    createdAt: post.created_at,
    title: translation?.title?.trim() || fallback?.title?.trim() || post.slug,
    excerpt: translation?.excerpt?.trim() || fallback?.excerpt?.trim() || '',
    content: translation?.content?.trim() || fallback?.content?.trim() || '',
    seoTitle: cleanSeoTitle(translation?.seo_title?.trim() || fallback?.seo_title?.trim() || translation?.title?.trim() || fallback?.title?.trim() || post.slug),
    seoDescription: translation?.seo_description?.trim() || fallback?.seo_description?.trim() || translation?.excerpt?.trim() || fallback?.excerpt?.trim() || '',
    attachments: attachments
      .filter((attachment) => attachment.post_id === post.id)
      .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at))
      .map((attachment) => ({ id: attachment.id, kind: attachment.kind, name: attachment.name, url: attachment.url, contentType: attachment.content_type, sizeBytes: attachment.size_bytes, sortOrder: attachment.sort_order })),
    locale,
  };
}

function localBlogPostsFor(locale: Locale): BlogPostView[] {
  return localBlogPosts
    .filter((post) => post.is_published)
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || (b.published_at ?? '').localeCompare(a.published_at ?? '') || a.sort_order - b.sort_order)
    .map((post) => mergeBlogPost(post, localBlogTranslations.filter((row) => row.post_id === post.id), localBlogAttachments, locale));
}

async function remoteBlogPosts(locale: Locale, featuredOnly = false): Promise<BlogPostView[] | null> {
  const client = getPublicClient();
  if (!client) return null;
  let query = client.from('blog_posts').select(publicPostFields).eq('is_published', true).order('is_featured', { ascending: false }).order('published_at', { ascending: false }).order('sort_order', { ascending: true });
  if (featuredOnly) query = query.eq('is_featured', true);
  const { data: posts, error } = await query;
  if (error || !posts) return null;
  if (!posts.length) return [];
  const ids = posts.map((post) => post.id);
  const [translationsResult, attachmentsResult] = await Promise.all([
    client.from('blog_post_translations').select(publicTranslationFields).in('post_id', ids),
    client.from('blog_post_attachments').select(publicAttachmentFields).in('post_id', ids),
  ]);
  if (translationsResult.error || attachmentsResult.error) return null;
  return posts.map((post) => mergeBlogPost(post, (translationsResult.data ?? []).filter((row) => row.post_id === post.id), attachmentsResult.data ?? [], locale));
}

export async function getBlogPosts(locale: Locale): Promise<BlogPostView[]> {
  return (await remoteBlogPosts(locale)) ?? localBlogPostsFor(locale);
}

export async function getFeaturedBlogPosts(locale: Locale, limit = 3): Promise<BlogPostView[]> {
  return ((await remoteBlogPosts(locale, true)) ?? localBlogPostsFor(locale).filter((post) => post.isFeatured)).slice(0, limit);
}

export async function getBlogPostBySlug(slug: string, locale: Locale): Promise<BlogPostView | null> {
  const client = getPublicClient();
  if (client) {
    const { data: post, error } = await client.from('blog_posts').select(publicPostFields).eq('slug', slug).eq('is_published', true).maybeSingle();
    if (!error && post) {
      const [translationsResult, attachmentsResult] = await Promise.all([
        client.from('blog_post_translations').select(publicTranslationFields).eq('post_id', post.id),
        client.from('blog_post_attachments').select(publicAttachmentFields).eq('post_id', post.id),
      ]);
      if (!translationsResult.error && !attachmentsResult.error) return mergeBlogPost(post, translationsResult.data ?? [], attachmentsResult.data ?? [], locale);
    }
    if (!error && !post) return null;
  }
  return localBlogPostsFor(locale).find((post) => post.slug === slug) ?? null;
}

export async function getPublishedBlogSlugs(): Promise<string[]> {
  const client = getPublicClient();
  if (client) {
    const { data } = await client.from('blog_posts').select('slug').eq('is_published', true);
    if (data) return data.map((row) => row.slug);
  }
  return localBlogPosts.filter((post) => post.is_published).map((post) => post.slug);
}

export async function getAdminBlogPosts(locale: Locale): Promise<BlogPostView[]> {
  const client = await getServerClient();
  if (client) {
    const [postsResult, translationsResult, attachmentsResult] = await Promise.all([
      client.from('blog_posts').select('*').order('is_featured', { ascending: false }).order('published_at', { ascending: false }).order('sort_order', { ascending: true }),
      client.from('blog_post_translations').select('*'),
      client.from('blog_post_attachments').select('*').order('sort_order', { ascending: true }),
    ]);
    if (!postsResult.error && !translationsResult.error && !attachmentsResult.error && postsResult.data) {
      return postsResult.data.map((post) => mergeBlogPost(post, (translationsResult.data ?? []).filter((row) => row.post_id === post.id), attachmentsResult.data ?? [], locale));
    }
  }
  return localBlogPosts
    .slice()
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order)
    .map((post) => mergeBlogPost(post, localBlogTranslations.filter((row) => row.post_id === post.id), localBlogAttachments, locale));
}

function toBlogInput(post: BlogPostRow, translations: BlogTranslationRow[], attachments: BlogAttachmentRow[]): BlogInput | null {
  const vi = translations.find((row) => row.locale === 'vi');
  const en = translations.find((row) => row.locale === 'en');
  if (!vi || !en) return null;
  return {
    slug: post.slug,
    authorName: post.author_name,
    coverUrl: post.cover_url ?? '',
    tags: post.tags,
    titleVi: vi.title,
    titleEn: en.title,
    excerptVi: vi.excerpt,
    excerptEn: en.excerpt,
    contentVi: vi.content,
    contentEn: en.content,
    seoTitleVi: cleanSeoTitle(vi.seo_title ?? ''),
    seoTitleEn: cleanSeoTitle(en.seo_title ?? ''),
    seoDescriptionVi: vi.seo_description ?? '',
    seoDescriptionEn: en.seo_description ?? '',
    attachments: attachments.filter((attachment) => attachment.post_id === post.id).map((attachment) => ({ id: attachment.id, kind: attachment.kind, name: attachment.name, url: attachment.url, contentType: attachment.content_type, sizeBytes: attachment.size_bytes, sortOrder: attachment.sort_order })),
    isPublished: post.is_published,
    isFeatured: post.is_featured,
  };
}

export async function getAdminBlogPostInput(id: string): Promise<BlogInput | null> {
  const client = await getServerClient();
  if (client) {
    const [postResult, translationsResult, attachmentsResult] = await Promise.all([
      client.from('blog_posts').select('*').eq('id', id).maybeSingle(),
      client.from('blog_post_translations').select('*').eq('post_id', id),
      client.from('blog_post_attachments').select('*').eq('post_id', id).order('sort_order', { ascending: true }),
    ]);
    if (!postResult.error && !translationsResult.error && !attachmentsResult.error && postResult.data) return toBlogInput(postResult.data, translationsResult.data ?? [], attachmentsResult.data ?? []);
  }
  const post = localBlogPosts.find((row) => row.id === id);
  return post ? toBlogInput(post, localBlogTranslations.filter((row) => row.post_id === id), localBlogAttachments) : null;
}

export { mergeBlogPost };
