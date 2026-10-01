'use server';

import { revalidatePath } from 'next/cache';
import { getServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { memberSchema, type MemberInput } from '@/lib/validators/member';
import { z } from 'zod';

type MemberMutationResult = { ok: true } | { ok: false; message: string };
const memberIdSchema = z.string().trim().min(1).max(100);
const memberDirectionSchema = z.enum(['up', 'down']);

export async function saveMember(input: MemberInput, id?: string): Promise<MemberMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsed = memberSchema.safeParse(input); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid member.' };
  const client = await getServerClient();
  if (client) {
    const row = { slug: parsed.data.slug, linkedin_url: parsed.data.linkedinUrl || null, avatar_url: parsed.data.avatarUrl || null, is_published: parsed.data.isPublished, sort_order: 0 };
    const parsedId = id ? memberIdSchema.safeParse(id) : null;
    if (id && !parsedId?.success) return { ok: false, message: 'Invalid member id.' };
    const previous = parsedId?.success ? await client.from('members').select('*').eq('id', parsedId.data).maybeSingle() : null;
    const result = parsedId?.success ? await client.from('members').update(row).eq('id', parsedId.data) : await client.from('members').insert(row).select('id').single();
    if (result.error) return { ok: false, message: result.error.message };
    const memberId = parsedId?.success ? parsedId.data : result.data?.id;
    if (memberId) {
      const translations = [{ member_id: memberId, locale: 'vi' as const, name: parsed.data.nameVi, role: parsed.data.roleVi, bio: parsed.data.bioVi }, { member_id: memberId, locale: 'en' as const, name: parsed.data.nameEn, role: parsed.data.roleEn, bio: parsed.data.bioEn }];
      const translationResult = await client.from('member_translations').upsert(translations);
      if (translationResult.error) {
        if (previous?.data) await client.from('members').update(previous.data).eq('id', memberId);
        else await client.from('members').delete().eq('id', memberId);
        return { ok: false, message: translationResult.error.message };
      }
    }
  }
  revalidatePath('/vi'); revalidatePath('/en'); revalidatePath('/vi/members'); revalidatePath('/en/members'); return { ok: true };
}

export async function deleteMember(id: string): Promise<MemberMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = memberIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: 'Invalid member id.' };
  const client = await getServerClient(); if (client) { const { error } = await client.from('members').delete().eq('id', parsedId.data); if (error) return { ok: false, message: error.message }; }
  revalidatePath('/vi'); revalidatePath('/en'); revalidatePath('/vi/members'); revalidatePath('/en/members'); return { ok: true };
}

export async function toggleMember(id: string, isPublished: boolean): Promise<MemberMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = memberIdSchema.safeParse(id);
  if (!parsedId.success || typeof isPublished !== 'boolean') return { ok: false, message: 'Invalid member toggle.' };
  const client = await getServerClient();
  if (client) {
    const { error } = await client.from('members').update({ is_published: isPublished }).eq('id', parsedId.data);
    if (error) return { ok: false, message: error.message };
  }
  revalidatePath('/vi'); revalidatePath('/en'); revalidatePath('/vi/members'); revalidatePath('/en/members');
  return { ok: true };
}

export async function reorderMember(id: string, direction: 'up' | 'down'): Promise<MemberMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = memberIdSchema.safeParse(id);
  const parsedDirection = memberDirectionSchema.safeParse(direction);
  if (!parsedId.success || !parsedDirection.success) return { ok: false, message: 'Invalid member order.' };
  const client = await getServerClient();
  if (client) {
    const { data: current } = await client.from('members').select('sort_order').eq('id', parsedId.data).maybeSingle();
    if (current) {
      const next = current.sort_order + (parsedDirection.data === 'up' ? -1 : 1);
      const { error } = await client.from('members').update({ sort_order: next }).eq('id', parsedId.data);
      if (error) return { ok: false, message: error.message };
    }
  }
  revalidatePath('/vi'); revalidatePath('/en'); revalidatePath('/vi/members'); revalidatePath('/en/members');
  return { ok: true };
}
