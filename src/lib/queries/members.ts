import { getPublicClient } from '@/lib/supabase/public';
import { byLocale, localMemberTranslations, localMembers } from '@/lib/data';
import type { Database, Locale } from '@/types/db';
import type { MemberView } from '@/types/view-models';

type MemberRow = Database['public']['Tables']['members']['Row'];
type TranslationRow = Database['public']['Tables']['member_translations']['Row'];

function mergeMember(member: MemberRow, translations: TranslationRow[], locale: Locale): MemberView {
  const translation = byLocale(translations, locale) ?? { member_id: member.id, locale, name: member.slug, role: '', bio: '' };
  return { id: member.id, slug: member.slug, avatarUrl: member.avatar_url, linkedinUrl: member.linkedin_url, name: translation.name, role: translation.role, bio: translation.bio, locale };
}

function localMembersFor(locale: Locale): MemberView[] {
  return localMembers.filter((member) => member.is_published).sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at)).map((member) => mergeMember(member, localMemberTranslations.filter((row) => row.member_id === member.id), locale));
}

export async function getMembers(locale: Locale): Promise<MemberView[]> {
  const client = getPublicClient();
  if (client) {
    const { data: members, error } = await client.from('members').select('*').eq('is_published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (!error && members) {
      const { data: translations, error: translationError } = await client.from('member_translations').select('*').in('member_id', members.map((row) => row.id));
      if (!translationError) return members.map((member) => mergeMember(member, (translations ?? []).filter((row) => row.member_id === member.id), locale));
    }
  }
  return localMembersFor(locale);
}

export async function getFeaturedMembers(locale: Locale, limit = 4): Promise<MemberView[]> {
  return (await getMembers(locale)).slice(0, limit);
}

export async function getPublishedMemberSlugs(): Promise<string[]> {
  const client = getPublicClient();
  if (client) {
    const { data } = await client.from('members').select('slug').eq('is_published', true);
    if (data) return data.map((row) => row.slug);
  }
  return localMembers.filter((member) => member.is_published).map((member) => member.slug);
}
