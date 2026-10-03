'use server';

import { getPublicClient } from '@/lib/supabase/public';
import { contactSchema, type ContactInput } from '@/lib/validators/contact';
import { checkRateLimit, rateLimitMessage } from '@/lib/rate-limit';

export type ContactResult = { ok: true } | { ok: false; message: string; fieldErrors?: Record<string, string> };

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ secret, response: token }) });
  if (!response.ok) return false;
  const result: unknown = await response.json();
  return typeof result === 'object' && result !== null && 'success' in result && result.success === true;
}

export async function submitContact(input: ContactInput): Promise<ContactResult> {
  if (!(await checkRateLimit('contact'))) return { ok: false, message: rateLimitMessage };
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) { const field = issue.path[0]; if (typeof field === 'string') fieldErrors[field] = issue.message; }
    return { ok: false, message: 'Please check the highlighted fields.', fieldErrors };
  }
  if (parsed.data.honeypot) return { ok: false, message: 'Unable to submit this message.' };
  if (!(await verifyTurnstile(parsed.data.turnstileToken ?? ''))) return { ok: false, message: 'Please complete the anti-spam check and try again.' };

  const client = getPublicClient();
  if (!client) return { ok: true };
  const { error } = await client.from('contact_messages').insert({ name: parsed.data.name, email: parsed.data.email, company: parsed.data.company || null, phone: parsed.data.phone || null, topic: parsed.data.topic, message: parsed.data.message, locale: parsed.data.locale });
  return error ? { ok: false, message: 'Unable to save your message right now.' } : { ok: true };
}
