'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { blogSchema, type BlogInput } from '@/lib/validators/blog';

export type BlogMutationResult = { ok: true } | { ok: false; message: string };

const blogIdSchema = z.string().trim().min(1).max(100);
const blogToggleSchema = z.object({ field: z.enum(['is_published', 'is_featured']), value: z.boolean() });
const blogDirectionSchema = z.enum(['up', 'down']);

function revalidateBlog(slug?: string) {
  revalidatePath('/vi');
  revalidatePath('/en');
  revalidatePath('/vi/blog');
  revalidatePath('/en/blog');
  revalidatePath('/sitemap.xml');
  if (slug) {
    revalidatePath(`/vi/blog/${slug}`);
    revalidatePath(`/en/blog/${slug}`);
  }
}

export async function saveBlogPost(input: BlogInput, id?: string): Promise<BlogMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsed = blogSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid blog post.' };
  const client = await getServerClient();
  if (client) {
    const parsedId = id ? blogIdSchema.safeParse(id) : null;
    if (id && !parsedId?.success) return { ok: false, message: 'Invalid blog post id.' };
    const previous = parsedId?.success ? await client.from('blog_posts').select('*').eq('id', parsedId.data).maybeSingle() : null;
    const publishedAt = parsed.data.isPublished ? previous?.data?.published_at ?? new Date().toISOString() : null;
    const row = {
      slug: parsed.data.slug,
      author_name: parsed.data.authorName,
      cover_url: parsed.data.coverUrl || null,
      tags: parsed.data.tags,
      is_published: parsed.data.isPublished,
      is_featured: parsed.data.isFeatured,
      sort_order: previous?.data?.sort_order ?? 0,
      published_at: publishedAt,
    };
    const result = parsedId?.success
      ? await client.from('blog_posts').update(row).eq('id', parsedId.data)
      : await client.from('blog_posts').insert(row).select('id').single();
    if (result.error) return { ok: false, message: result.error.message };
    const postId = parsedId?.success ? parsedId.data : result.data?.id;
    if (!postId) return { ok: false, message: 'Unable to create the blog post.' };
    const translations = [
      { post_id: postId, locale: 'vi' as const, title: parsed.data.titleVi, excerpt: parsed.data.excerptVi, content: parsed.data.contentVi, seo_title: parsed.data.seoTitleVi || null, seo_description: parsed.data.seoDescriptionVi || null },
      { post_id: postId, locale: 'en' as const, title: parsed.data.titleEn, excerpt: parsed.data.excerptEn, content: parsed.data.contentEn, seo_title: parsed.data.seoTitleEn || null, seo_description: parsed.data.seoDescriptionEn || null },
    ];
    const translationResult = await client.from('blog_post_translations').upsert(translations);
    if (translationResult.error) return { ok: false, message: translationResult.error.message };
    const attachmentDelete = await client.from('blog_post_attachments').delete().eq('post_id', postId);
    if (attachmentDelete.error) return { ok: false, message: attachmentDelete.error.message };
    if (parsed.data.attachments.length) {
      const attachmentResult = await client.from('blog_post_attachments').insert(parsed.data.attachments.map((attachment) => ({
        post_id: postId,
        kind: attachment.kind,
        name: attachment.name,
        url: attachment.url,
        content_type: attachment.contentType,
        size_bytes: attachment.sizeBytes,
        sort_order: attachment.sortOrder,
      })));
      if (attachmentResult.error) return { ok: false, message: attachmentResult.error.message };
    }
    revalidateBlog(parsed.data.slug);
    return { ok: true };
  }
  revalidateBlog(parsed.data.slug);
  return { ok: true };
}

export async function toggleBlogPost(id: string, field: 'is_published' | 'is_featured', value: boolean): Promise<BlogMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = blogIdSchema.safeParse(id);
  const parsedToggle = blogToggleSchema.safeParse({ field, value });
  if (!parsedId.success || !parsedToggle.success) return { ok: false, message: 'Invalid blog post toggle.' };
  const client = await getServerClient();
  if (client) {
    const update = parsedToggle.data.field === 'is_published'
      ? { is_published: parsedToggle.data.value, published_at: parsedToggle.data.value ? new Date().toISOString() : null }
      : { is_featured: parsedToggle.data.value };
    const { error } = await client.from('blog_posts').update(update).eq('id', parsedId.data);
    if (error) return { ok: false, message: error.message };
  }
  revalidateBlog();
  return { ok: true };
}

export async function deleteBlogPost(id: string): Promise<BlogMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = blogIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: 'Invalid blog post id.' };
  const client = await getServerClient();
  if (client) {
    const { data: attachments } = await client.from('blog_post_attachments').select('url').eq('post_id', parsedId.data);
    const { error } = await client.from('blog_posts').delete().eq('id', parsedId.data);
    if (error) return { ok: false, message: error.message };
    const paths = (attachments ?? []).map((attachment) => attachment.url.split('/blog-media/')[1]).filter((path): path is string => Boolean(path));
    if (paths.length) await client.storage.from('blog-media').remove(paths);
  }
  revalidateBlog();
  return { ok: true };
}

export async function reorderBlogPost(id: string, direction: 'up' | 'down'): Promise<BlogMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = blogIdSchema.safeParse(id);
  const parsedDirection = blogDirectionSchema.safeParse(direction);
  if (!parsedId.success || !parsedDirection.success) return { ok: false, message: 'Invalid blog post order.' };
  const client = await getServerClient();
  if (client) {
    const { data: current } = await client.from('blog_posts').select('sort_order').eq('id', parsedId.data).maybeSingle();
    if (current) {
      const { error } = await client.from('blog_posts').update({ sort_order: current.sort_order + (parsedDirection.data === 'up' ? -1 : 1) }).eq('id', parsedId.data);
      if (error) return { ok: false, message: error.message };
    }
  }
  revalidateBlog();
  return { ok: true };
}
