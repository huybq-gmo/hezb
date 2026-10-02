import { z } from 'zod';

export const employmentTypeSchema = z.enum(['full_time', 'part_time', 'contract', 'internship']);
export const jobStatusSchema = z.enum(['new', 'reviewing', 'shortlisted', 'rejected', 'archived']);

export const jobSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  employmentType: employmentTypeSchema,
  location: z.string().trim().min(1).max(160),
  isRemote: z.boolean(),
  titleVi: z.string().trim().min(1).max(180),
  titleEn: z.string().trim().min(1).max(180),
  summaryVi: z.string().trim().min(1).max(500),
  summaryEn: z.string().trim().min(1).max(500),
  descriptionVi: z.string().max(10000),
  descriptionEn: z.string().max(10000),
  requirementsVi: z.string().max(10000),
  requirementsEn: z.string().max(10000),
  isPublished: z.boolean(),
});

export type JobInput = z.infer<typeof jobSchema>;

export const jobApplicationFieldsSchema = z.object({
  jobId: z.string().trim().min(1).max(100),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40),
  portfolioUrl: z.string().trim().url().max(500).optional().or(z.literal('')),
  coverNote: z.string().trim().min(10).max(5000),
  locale: z.enum(['vi', 'en']),
  honeypot: z.string().max(200),
  turnstileToken: z.string().max(4096),
});

export const applicationIdSchema = z.string().uuid();

export type JobApplicationFields = z.infer<typeof jobApplicationFieldsSchema>;

export const candidateCvTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const candidateCvExtensions = ['.pdf', '.doc', '.docx'] as const;
export const candidateCvMaxBytes = 5 * 1024 * 1024;
