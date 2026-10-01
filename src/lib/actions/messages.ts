'use server';

import { revalidatePath } from 'next/cache';
import { getServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin-guard';

export async function updateMessageStatus(id: string, status: 'new' | 'read' | 'replied' | 'archived') {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const client = await getServerClient(); if (client) { const { error } = await client.from('contact_messages').update({ status }).eq('id', id); if (error) return { ok: false, message: error.message }; }
  revalidatePath('/admin/messages'); return { ok: true };
}
