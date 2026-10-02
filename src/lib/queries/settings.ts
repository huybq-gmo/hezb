import { getPublicClient } from '@/lib/supabase/public';
import { getServerClient } from '@/lib/supabase/server';
import { localSiteSettings } from '@/lib/data';
import type { Database, Locale } from '@/types/db';
import type { SiteSettingsView } from '@/types/view-models';
import type { SiteSettingsInput } from '@/lib/validators/settings';

type SettingsRow = Database['public']['Tables']['site_settings']['Row'];

function toView(row: SettingsRow, locale: Locale): SiteSettingsView {
  return {
    email: row.email,
    phone: row.phone,
    address: locale === 'en' ? row.address_en : row.address_vi,
    responseTime: locale === 'en' ? row.response_time_en : row.response_time_vi,
  };
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettingsView> {
  const client = getPublicClient();
  if (client) {
    const { data, error } = await client.from('site_settings').select('id, email, phone, address_vi, address_en, response_time_vi, response_time_en, created_at, updated_at').eq('id', 1).maybeSingle();
    if (!error && data) return toView(data, locale);
  }
  return locale === 'en' ? localSiteSettings.en : localSiteSettings.vi;
}

export async function getAdminSiteSettings(): Promise<SiteSettingsInput> {
  const client = await getServerClient();
  if (client) {
    const { data, error } = await client.from('site_settings').select('id, email, phone, address_vi, address_en, response_time_vi, response_time_en, created_at, updated_at').eq('id', 1).maybeSingle();
    if (!error && data) return { email: data.email, phone: data.phone, addressVi: data.address_vi, addressEn: data.address_en, responseTimeVi: data.response_time_vi, responseTimeEn: data.response_time_en };
  }
  return { ...localSiteSettings.raw };
}
