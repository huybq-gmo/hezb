import { z } from 'zod';

const approvedMediaUrl = z.string().trim().refine((value) => {
  if (value === '') return true;
  if (value.startsWith('/brand/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.in'));
  } catch {
    return false;
  }
}, 'Use a Hezb brand path or a Supabase Storage URL.');

export const memberSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nameVi: z.string().trim().min(1), nameEn: z.string().trim().min(1),
  roleVi: z.string().trim().min(1), roleEn: z.string().trim().min(1),
  bioVi: z.string().max(5000), bioEn: z.string().max(5000),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  avatarUrl: approvedMediaUrl.optional().or(z.literal('')),
  isPublished: z.boolean(),
});

export type MemberInput = z.infer<typeof memberSchema>;
