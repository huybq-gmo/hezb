import { getPublicClient } from '@/lib/supabase/public';
import { localCategories } from '@/lib/data';
import type { Locale } from '@/types/db';
import type { CategoryView } from '@/types/view-models';

export async function getCategories(locale: Locale): Promise<CategoryView[]> {
  const client = getPublicClient();
  if (client) {
    const { data, error } = await client.from('categories').select('*').order('sort_order', { ascending: true });
    if (!error && data) return data.map((row) => ({ id: row.id, slug: row.slug, name: locale === 'en' ? row.name_en : row.name_vi, sortOrder: row.sort_order }));
  }
  return localCategories.map((row) => ({ id: row.id, slug: row.slug, name: locale === 'en' ? row.name_en : row.name_vi, sortOrder: row.sort_order }));
}
