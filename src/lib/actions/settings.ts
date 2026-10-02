'use server';

import { revalidatePath } from 'next/cache';
import { getServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/validators/settings';

export async function saveSiteSettings(input: SiteSettingsInput): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Please review the contact information.' };
  const client = await getServerClient();
  if (!client) return { ok: false, message: 'Supabase is not configured.' };
  const { error } = await client.from('site_settings').upsert({ id: 1, email: parsed.data.email, phone: parsed.data.phone, address_vi: parsed.data.addressVi, address_en: parsed.data.addressEn, response_time_vi: parsed.data.responseTimeVi, response_time_en: parsed.data.responseTimeEn }, { onConflict: 'id' });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/vi/contact');
  revalidatePath('/en/contact');
  revalidatePath('/admin/settings');
  return { ok: true };
}
