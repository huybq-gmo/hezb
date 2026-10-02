import { z } from 'zod';

const approvedMediaUrl = z.string().trim().refine((value) => {
  if (value === '') return true;
  if (value.startsWith('/brand/') || value.startsWith('/illustrations/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.in'));
  } catch {
    return false;
  }
}, 'Use a Hezb asset path or a Supabase Storage URL.');

export const blogAttachmentSchema = z.object({
  id: z.string().trim().min(1).max(100),
  kind: z.enum(['image', 'file']),
  name: z.string().trim().min(1).max(180),
  url: approvedMediaUrl,
  contentType: z.string().trim().min(1).max(120),
  sizeBytes: z.coerce.number().int().min(1).max(5 * 1024 * 1024),
  sortOrder: z.coerce.number().int().min(0).max(1000),
});

export const blogSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens.'),
  authorName: z.string().trim().min(1).max(160),
  tags: z.array(z.string().trim().min(1).max(40)).max(12),
  coverUrl: approvedMediaUrl.optional().or(z.literal('')),
  titleVi: z.string().trim().min(1).max(180),
  titleEn: z.string().trim().min(1).max(180),
  excerptVi: z.string().trim().min(1).max(500),
  excerptEn: z.string().trim().min(1).max(500),
  contentVi: z.string().max(60000),
  contentEn: z.string().max(60000),
  seoTitleVi: z.string().trim().max(180),
  seoTitleEn: z.string().trim().max(180),
  seoDescriptionVi: z.string().trim().max(320),
  seoDescriptionEn: z.string().trim().max(320),
  attachments: z.array(blogAttachmentSchema).max(20),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

export type BlogAttachmentInput = z.infer<typeof blogAttachmentSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
