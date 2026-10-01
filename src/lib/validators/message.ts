import { z } from 'zod';

export const messageIdSchema = z.string().trim().min(1).max(100);
export const messageStatusSchema = z.enum(['new', 'read', 'replied', 'archived']);

export type MessageStatus = z.infer<typeof messageStatusSchema>;
