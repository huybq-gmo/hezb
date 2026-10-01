'use server';

import { revalidatePath } from 'next/cache';
import { getServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { projectSchema, type ProjectInput } from '@/lib/validators/project';

export type MutationResult = { ok: true } | { ok: false; message: string };

export async function saveProject(input: ProjectInput, id?: string): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsed = projectSchema.safeParse(input); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid project.' };
  const client = await getServerClient();
  if (client) {
    const row = { slug: parsed.data.slug, client_name: parsed.data.clientName || null, year: parsed.data.year, tech: parsed.data.tech, is_published: parsed.data.isPublished, is_featured: parsed.data.isFeatured, category_id: null, cover_url: null, gallery: [], website_url: null, sort_order: 0 };
    const result = id ? await client.from('projects').update(row).eq('id', id) : await client.from('projects').insert(row);
    if (result.error) return { ok: false, message: result.error.message };
  }
  for (const locale of ['vi', 'en'] as const) revalidatePath(`/${locale}/projects`);
  return { ok: true };
}

export async function toggleProject(id: string, field: 'is_published' | 'is_featured', value: boolean): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const client = await getServerClient(); if (client) { const { error } = await client.from('projects').update({ [field]: value }).eq('id', id); if (error) return { ok: false, message: error.message }; }
  revalidatePath('/vi'); revalidatePath('/en'); revalidatePath('/vi/projects'); revalidatePath('/en/projects'); return { ok: true };
}

export async function deleteProject(id: string): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const client = await getServerClient(); if (client) { const { error } = await client.from('projects').delete().eq('id', id); if (error) return { ok: false, message: error.message }; }
  revalidatePath('/vi/projects'); revalidatePath('/en/projects'); return { ok: true };
}
