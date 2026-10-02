'use server';

import { revalidatePath } from 'next/cache';
import { getPublicClient } from '@/lib/supabase/public';
import { getServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/supabase/admin-guard';
import { applicationIdSchema, candidateCvExtensions, candidateCvMaxBytes, candidateCvTypes, jobApplicationFieldsSchema, jobSchema, jobStatusSchema, type JobInput } from '@/lib/validators/career';
import { z } from 'zod';

type MutationResult = { ok: true } | { ok: false; message: string };
const idSchema = z.string().trim().min(1).max(100);
const directionSchema = z.enum(['up', 'down']);

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });
  if (!response.ok) return false;
  const result: unknown = await response.json();
  return typeof result === 'object' && result !== null && 'success' in result && result.success === true;
}

function value(form: FormData, key: string): string {
  const raw = form.get(key);
  return typeof raw === 'string' ? raw : '';
}

export async function applyToJob(form: FormData): Promise<MutationResult> {
  const rawFile = form.get('cv');
  const file = rawFile instanceof File ? rawFile : null;
  const fields = jobApplicationFieldsSchema.safeParse({
    jobId: value(form, 'jobId'),
    name: value(form, 'name'),
    email: value(form, 'email'),
    phone: value(form, 'phone'),
    portfolioUrl: value(form, 'portfolioUrl'),
    coverNote: value(form, 'coverNote'),
    locale: value(form, 'locale'),
    honeypot: value(form, 'website'),
    turnstileToken: value(form, 'turnstileToken'),
  });
  if (!fields.success) return { ok: false, message: fields.error.issues[0]?.message ?? 'Please check your application.' };
  if (fields.data.honeypot) return { ok: false, message: 'Unable to submit this application.' };
  if (!(await verifyTurnstile(fields.data.turnstileToken))) return { ok: false, message: 'Please complete the anti-spam check and try again.' };
  if (!file || !candidateCvTypes.includes(file.type as (typeof candidateCvTypes)[number])) return { ok: false, message: 'Please upload a PDF, DOC or DOCX CV.' };
  if (file.size < 1 || file.size > candidateCvMaxBytes) return { ok: false, message: 'Your CV must be 5 MB or smaller.' };
  const extension = candidateCvExtensions.find((item) => file.name.toLowerCase().endsWith(item));
  if (!extension) return { ok: false, message: 'Please upload a PDF, DOC or DOCX CV.' };

  const client = getPublicClient();
  if (!client) return { ok: true };
  const jobId = fields.data.jobId;
  const jobResult = await client.from('jobs').select('id').eq('id', jobId).eq('is_published', true).maybeSingle();
  if (jobResult.error || !jobResult.data) return { ok: false, message: 'This position is no longer accepting applications.' };
  const path = `incoming/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120)}`;
  const upload = await client.storage.from('candidate-cvs').upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) return { ok: false, message: 'Unable to upload your CV right now.' };
  const insert = await client.from('job_applications').insert({
    job_id: jobResult.data.id,
    name: fields.data.name,
    email: fields.data.email,
    phone: fields.data.phone || null,
    portfolio_url: fields.data.portfolioUrl || null,
    cover_note: fields.data.coverNote,
    cv_path: path,
    cv_filename: file.name.slice(0, 255),
    cv_content_type: file.type as 'application/pdf' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    cv_size: file.size,
    locale: fields.data.locale,
  });
  if (insert.error) return { ok: false, message: 'Unable to save your application right now.' };
  revalidatePath('/admin/careers');
  return { ok: true };
}

export async function saveJob(input: JobInput, id?: string): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid job.' };
  const parsedId = id ? idSchema.safeParse(id) : null;
  if (id && !parsedId?.success) return { ok: false, message: 'Invalid job id.' };
  const client = await getServerClient();
  if (client) {
    const row = { slug: parsed.data.slug, employment_type: parsed.data.employmentType, location: parsed.data.location, is_remote: parsed.data.isRemote, is_published: parsed.data.isPublished, sort_order: 0 };
    const result = parsedId?.success
      ? await client.from('jobs').update(row).eq('id', parsedId.data)
      : await client.from('jobs').insert(row).select('id').single();
    if (result.error) return { ok: false, message: result.error.message };
    const jobId = parsedId?.success ? parsedId.data : result.data?.id;
    if (jobId) {
      const translations = [
        { job_id: jobId, locale: 'vi' as const, title: parsed.data.titleVi, summary: parsed.data.summaryVi, description: parsed.data.descriptionVi, requirements: parsed.data.requirementsVi },
        { job_id: jobId, locale: 'en' as const, title: parsed.data.titleEn, summary: parsed.data.summaryEn, description: parsed.data.descriptionEn, requirements: parsed.data.requirementsEn },
      ];
      const translationResult = await client.from('job_translations').upsert(translations);
      if (translationResult.error) return { ok: false, message: translationResult.error.message };
    }
  }
  revalidatePath('/vi/careers');
  revalidatePath('/en/careers');
  revalidatePath('/admin/careers');
  return { ok: true };
}

export async function deleteJob(id: string): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, message: 'Invalid job id.' };
  const client = await getServerClient();
  if (client) {
    const { error } = await client.from('jobs').delete().eq('id', parsed.data);
    if (error) return { ok: false, message: error.message };
  }
  revalidatePath('/vi/careers'); revalidatePath('/en/careers'); revalidatePath('/admin/careers');
  return { ok: true };
}

export async function toggleJob(id: string, isPublished: boolean): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsed = idSchema.safeParse(id);
  if (!parsed.success || typeof isPublished !== 'boolean') return { ok: false, message: 'Invalid job toggle.' };
  const client = await getServerClient();
  if (client) {
    const { error } = await client.from('jobs').update({ is_published: isPublished }).eq('id', parsed.data);
    if (error) return { ok: false, message: error.message };
  }
  revalidatePath('/vi/careers'); revalidatePath('/en/careers'); revalidatePath('/admin/careers');
  return { ok: true };
}

export async function reorderJob(id: string, direction: 'up' | 'down'): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsed = idSchema.safeParse(id);
  const parsedDirection = directionSchema.safeParse(direction);
  if (!parsed.success || !parsedDirection.success) return { ok: false, message: 'Invalid job order.' };
  const client = await getServerClient();
  if (client) {
    const { data: current } = await client.from('jobs').select('sort_order').eq('id', parsed.data).maybeSingle();
    if (current) {
      const { error } = await client.from('jobs').update({ sort_order: current.sort_order + (parsedDirection.data === 'up' ? -1 : 1) }).eq('id', parsed.data);
      if (error) return { ok: false, message: error.message };
    }
  }
  revalidatePath('/vi/careers'); revalidatePath('/en/careers'); revalidatePath('/admin/careers');
  return { ok: true };
}

export async function updateApplicationStatus(id: string, status: string): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = applicationIdSchema.safeParse(id);
  const parsedStatus = jobStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { ok: false, message: 'Invalid application update.' };
  const client = await getServerClient();
  if (client) {
    const { error } = await client.from('job_applications').update({ status: parsedStatus.data }).eq('id', parsedId.data);
    if (error) return { ok: false, message: error.message };
  }
  revalidatePath('/admin/careers');
  return { ok: true };
}

export async function deleteApplication(id: string): Promise<MutationResult> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  const parsedId = applicationIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: 'Invalid application id.' };
  const client = await getServerClient();
  if (client) {
    const application = await client.from('job_applications').select('cv_path').eq('id', parsedId.data).maybeSingle();
    const { error } = await client.from('job_applications').delete().eq('id', parsedId.data);
    if (error) return { ok: false, message: error.message };
    if (application.data?.cv_path) await client.storage.from('candidate-cvs').remove([application.data.cv_path]);
  }
  revalidatePath('/admin/careers');
  return { ok: true };
}

export async function getApplicationCvUrl(path: string): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  if (!(await requireAdmin())) return { ok: false, message: 'Admin access required.' };
  if (!path.startsWith('incoming/')) return { ok: false, message: 'Invalid CV path.' };
  const client = await getServerClient();
  if (!client) return { ok: false, message: 'Storage is not configured.' };
  const result = await client.storage.from('candidate-cvs').createSignedUrl(path, 60 * 5);
  if (result.error || !result.data?.signedUrl) return { ok: false, message: 'Unable to open this CV.' };
  return { ok: true, url: result.data.signedUrl };
}
