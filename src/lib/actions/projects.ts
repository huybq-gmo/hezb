'use server';

import { revalidatePath } from 'next/cache';
import { getServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { projectSchema, type ProjectInput } from '@/lib/validators/project';
import { z } from 'zod';

export type MutationResult = { ok: true } | { ok: false; message: string };
const projectIdSchema = z.string().trim().min(1).max(100);
const projectToggleSchema = z.object({ field: z.enum(['is_published', 'is_featured']), value: z.boolean() });
const projectDirectionSchema = z.enum(['up', 'down']);

export async function saveProject(input: ProjectInput, id?: string): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsed = projectSchema.safeParse(input); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid project.' };
  const client = await getServerClient();
  if (client) {
    const { data: category } = await client.from('categories').select('id').eq('slug', parsed.data.categorySlug).maybeSingle();
    const row = { slug: parsed.data.slug, client_name: parsed.data.clientName || null, year: parsed.data.year, tech: parsed.data.tech, is_published: parsed.data.isPublished, is_featured: parsed.data.isFeatured, category_id: category?.id ?? null, cover_url: parsed.data.coverUrl || null, gallery: [], website_url: parsed.data.websiteUrl || null, sort_order: 0 };
    const parsedId = id ? projectIdSchema.safeParse(id) : null;
    if (id && !parsedId?.success) return { ok: false, message: 'Invalid project id.' };
    const previous = parsedId?.success ? await client.from('projects').select('*').eq('id', parsedId.data).maybeSingle() : null;
    const result = parsedId?.success ? await client.from('projects').update(row).eq('id', parsedId.data) : await client.from('projects').insert(row).select('id').single();
    if (result.error) return { ok: false, message: result.error.message };
    const projectId = parsedId?.success ? parsedId.data : result.data?.id;
    if (projectId) {
      const translations = [{ project_id: projectId, locale: 'vi' as const, title: parsed.data.titleVi, summary: parsed.data.summaryVi, content: parsed.data.contentVi, result: parsed.data.resultVi }, { project_id: projectId, locale: 'en' as const, title: parsed.data.titleEn, summary: parsed.data.summaryEn, content: parsed.data.contentEn, result: parsed.data.resultEn }];
      const translationResult = await client.from('project_translations').upsert(translations);
      if (translationResult.error) {
        if (previous?.data) await client.from('projects').update(previous.data).eq('id', projectId);
        else await client.from('projects').delete().eq('id', projectId);
        return { ok: false, message: translationResult.error.message };
      }
    }
  }
  for (const locale of ['vi', 'en'] as const) revalidatePath(`/${locale}/projects`);
  return { ok: true };
}

export async function toggleProject(id: string, field: 'is_published' | 'is_featured', value: boolean): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = projectIdSchema.safeParse(id);
  const parsedToggle = projectToggleSchema.safeParse({ field, value });
  if (!parsedId.success || !parsedToggle.success) return { ok: false, message: 'Invalid project toggle.' };
  const client = await getServerClient();
  if (client) {
    const result = parsedToggle.data.field === 'is_published'
      ? await client.from('projects').update({ is_published: parsedToggle.data.value }).eq('id', parsedId.data)
      : await client.from('projects').update({ is_featured: parsedToggle.data.value }).eq('id', parsedId.data);
    if (result.error) return { ok: false, message: result.error.message };
  }
  revalidatePath('/vi'); revalidatePath('/en'); revalidatePath('/vi/projects'); revalidatePath('/en/projects'); return { ok: true };
}

export async function deleteProject(id: string): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = projectIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: 'Invalid project id.' };
  const client = await getServerClient(); if (client) { const { error } = await client.from('projects').delete().eq('id', parsedId.data); if (error) return { ok: false, message: error.message }; }
  revalidatePath('/vi/projects'); revalidatePath('/en/projects'); return { ok: true };
}

export async function reorderProject(id: string, direction: 'up' | 'down'): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = projectIdSchema.safeParse(id);
  const parsedDirection = projectDirectionSchema.safeParse(direction);
  if (!parsedId.success || !parsedDirection.success) return { ok: false, message: 'Invalid project order.' };
  const client = await getServerClient();
  if (client) {
    const { data: current } = await client.from('projects').select('sort_order').eq('id', parsedId.data).maybeSingle();
    if (current) { const next = current.sort_order + (parsedDirection.data === 'up' ? -1 : 1); const { error } = await client.from('projects').update({ sort_order: next }).eq('id', parsedId.data); if (error) return { ok: false, message: error.message }; }
  }
  revalidatePath('/vi'); revalidatePath('/en'); revalidatePath('/vi/projects'); revalidatePath('/en/projects'); return { ok: true };
}
