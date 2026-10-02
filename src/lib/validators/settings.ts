import { z } from 'zod';

export const siteSettingsSchema = z.object({
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(3).max(60),
  addressVi: z.string().trim().min(2).max(180),
  addressEn: z.string().trim().min(2).max(180),
  responseTimeVi: z.string().trim().min(2).max(120),
  responseTimeEn: z.string().trim().min(2).max(120),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
