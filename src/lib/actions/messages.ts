'use server';

import { revalidatePath } from 'next/cache';
import { getServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { messageIdSchema, messageStatusSchema, type MessageStatus } from '@/lib/validators/message';

type MessageMutationResult = { ok: true } | { ok: false; message: string };

export async function updateMessageStatus(id: string, status: MessageStatus): Promise<MessageMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = messageIdSchema.safeParse(id);
  const parsedStatus = messageStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { ok: false, message: 'Invalid message update.' };
  const client = await getServerClient();
  if (client) {
    const { error } = await client.from('contact_messages').update({ status: parsedStatus.data }).eq('id', parsedId.data);
    if (error) return { ok: false, message: error.message };
  }
  revalidatePath('/admin/messages'); return { ok: true };
}

export async function deleteMessage(id: string): Promise<MessageMutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = messageIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: 'Invalid message id.' };
  const client = await getServerClient();
  if (client) {
    const { error } = await client.from('contact_messages').delete().eq('id', parsedId.data);
    if (error) return { ok: false, message: error.message };
  }
  revalidatePath('/admin');
  revalidatePath('/admin/messages');
  return { ok: true };
}
