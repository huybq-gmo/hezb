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

export const projectSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens.'),
  categorySlug: z.string().min(1),
  clientName: z.string().trim().max(160).optional(),
  year: z.coerce.number().int().min(2000).max(2100),
  tech: z.array(z.string().trim().min(1)).max(20),
  coverUrl: approvedMediaUrl.optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  titleVi: z.string().trim().min(1), titleEn: z.string().trim().min(1),
  summaryVi: z.string().trim().min(1), summaryEn: z.string().trim().min(1),
  contentVi: z.string().max(30000), contentEn: z.string().max(30000),
  resultVi: z.string().max(5000), resultEn: z.string().max(5000),
  isPublished: z.boolean(), isFeatured: z.boolean(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
