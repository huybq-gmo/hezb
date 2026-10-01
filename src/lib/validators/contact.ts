import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email.').max(255),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  phone: z.string().trim().max(60).optional().or(z.literal('')),
  topic: z.enum(['ai', 'custom_software', 'automation', 'other']),
  message: z.string().trim().min(5, 'Please tell us a little about the project.').max(5000),
  locale: z.enum(['vi', 'en']),
  honeypot: z.string().max(0).optional().or(z.literal('')),
  turnstileToken: z.string().optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof contactSchema>;
