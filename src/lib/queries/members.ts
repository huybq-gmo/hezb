import { getPublicClient } from '@/lib/supabase/public';
import { getServerClient } from '@/lib/supabase/server';
import { byLocale, localMemberTranslations, localMembers } from '@/lib/data';
import type { Database, Locale } from '@/types/db';
import type { MemberView } from '@/types/view-models';

type MemberRow = Database['public']['Tables']['members']['Row'];
type TranslationRow = Database['public']['Tables']['member_translations']['Row'];

const publicMemberFields = 'id, slug, avatar_url, linkedin_url, is_published, sort_order, created_at, updated_at';
const publicTranslationFields = 'member_id, locale, name, role, bio';

function mergeMember(member: MemberRow, translations: TranslationRow[], locale: Locale): MemberView {
  const translation = byLocale(translations, locale);
  const fallback = byLocale(translations, 'vi');
  return {
    id: member.id,
    slug: member.slug,
    avatarUrl: member.avatar_url,
    linkedinUrl: member.linkedin_url,
    isPublished: member.is_published,
    sortOrder: member.sort_order,
    name: translation?.name?.trim() || fallback?.name?.trim() || member.slug,
    role: translation?.role?.trim() || fallback?.role?.trim() || '',
    bio: translation?.bio?.trim() || fallback?.bio?.trim() || '',
    locale,
  };
}

function localMembersFor(locale: Locale): MemberView[] {
  return localMembers.filter((member) => member.is_published).sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at)).map((member) => mergeMember(member, localMemberTranslations.filter((row) => row.member_id === member.id), locale));
}

export async function getMembers(locale: Locale, limit?: number): Promise<MemberView[]> {
  const client = getPublicClient();
  if (client) {
    let query = client.from('members').select(publicMemberFields).eq('is_published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data: members, error } = await query;
    if (!error && members) {
      if (!members.length) return [];
      const { data: translations, error: translationError } = await client.from('member_translations').select(publicTranslationFields).in('member_id', members.map((row) => row.id));
      if (!translationError) return members.map((member) => mergeMember(member, (translations ?? []).filter((row) => row.member_id === member.id), locale));
    }
  }
  const fallback = localMembersFor(locale);
  return limit ? fallback.slice(0, limit) : fallback;
}

export async function getAdminMembers(locale: Locale): Promise<MemberView[]> {
  const client = await getServerClient();
  if (client) {
    const [membersResult, translationsResult] = await Promise.all([
      client.from('members').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      client.from('member_translations').select('*'),
    ]);
    if (!membersResult.error && !translationsResult.error && membersResult.data) {
      return membersResult.data.map((member) => mergeMember(member, (translationsResult.data ?? []).filter((row) => row.member_id === member.id), locale));
    }
  }
  return localMembers
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at))
    .map((member) => mergeMember(member, localMemberTranslations.filter((row) => row.member_id === member.id), locale));
}

export async function getAdminMemberInput(id: string) {
  const client = await getServerClient();
  if (client) {
    const [memberResult, translationsResult] = await Promise.all([
      client.from('members').select('*').eq('id', id).maybeSingle(),
      client.from('member_translations').select('*').eq('member_id', id),
    ]);
    if (!memberResult.error && !translationsResult.error && memberResult.data) {
      const vi = translationsResult.data.find((row) => row.locale === 'vi');
      const en = translationsResult.data.find((row) => row.locale === 'en');
      if (vi && en) return { slug: memberResult.data.slug, nameVi: vi.name, nameEn: en.name, roleVi: vi.role, roleEn: en.role, bioVi: vi.bio, bioEn: en.bio, linkedinUrl: memberResult.data.linkedin_url ?? '', avatarUrl: memberResult.data.avatar_url ?? '', isPublished: memberResult.data.is_published };
    }
  }
  const member = localMembers.find((item) => item.id === id);
  if (!member) return null;
  const vi = localMemberTranslations.find((row) => row.member_id === id && row.locale === 'vi');
  const en = localMemberTranslations.find((row) => row.member_id === id && row.locale === 'en');
  if (!vi || !en) return null;
  return { slug: member.slug, nameVi: vi.name, nameEn: en.name, roleVi: vi.role, roleEn: en.role, bioVi: vi.bio, bioEn: en.bio, linkedinUrl: member.linkedin_url ?? '', avatarUrl: member.avatar_url ?? '', isPublished: member.is_published };
}

export async function getFeaturedMembers(locale: Locale, limit = 4): Promise<MemberView[]> {
  return getMembers(locale, limit);
}

export async function getPublishedMemberSlugs(): Promise<string[]> {
  const client = getPublicClient();
  if (client) {
    const { data } = await client.from('members').select('slug').eq('is_published', true);
    if (data) return data.map((row) => row.slug);
  }
  return localMembers.filter((member) => member.is_published).map((member) => member.slug);
}
