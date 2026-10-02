import { getPublicClient } from '@/lib/supabase/public';
import { getServerClient } from '@/lib/supabase/server';
import { byLocale, localJobs, localJobTranslations } from '@/lib/data';
import type { Database, Locale } from '@/types/db';
import type { JobApplicationView, JobView } from '@/types/view-models';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type JobTranslation = Database['public']['Tables']['job_translations']['Row'];

function mergeJob(job: JobRow, translations: JobTranslation[], locale: Locale): JobView {
  const translation = byLocale(translations, locale);
  const fallback = byLocale(translations, 'vi');
  return {
    id: job.id,
    slug: job.slug,
    employmentType: job.employment_type,
    location: job.location,
    isRemote: job.is_remote,
    isPublished: job.is_published,
    sortOrder: job.sort_order,
    title: translation?.title?.trim() || fallback?.title?.trim() || job.slug,
    summary: translation?.summary?.trim() || fallback?.summary?.trim() || '',
    description: translation?.description?.trim() || fallback?.description?.trim() || '',
    requirements: translation?.requirements?.trim() || fallback?.requirements?.trim() || '',
    locale,
  };
}

function localJobsFor(locale: Locale): JobView[] {
  return localJobs
    .filter((job) => job.is_published)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at))
    .map((job) => mergeJob(job, localJobTranslations.filter((row) => row.job_id === job.id), locale));
}

export async function getPublishedJobs(locale: Locale): Promise<JobView[]> {
  const client = getPublicClient();
  if (client) {
    const jobsResult = await client.from('jobs').select('*').eq('is_published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (!jobsResult.error && jobsResult.data) {
      const translationResult = await client.from('job_translations').select('*').in('job_id', jobsResult.data.map((job) => job.id));
      if (!translationResult.error) return jobsResult.data.map((job) => mergeJob(job, (translationResult.data ?? []).filter((row) => row.job_id === job.id), locale));
    }
  }
  return localJobsFor(locale);
}

export async function getAdminJobs(locale: Locale): Promise<JobView[]> {
  const client = await getServerClient();
  if (client) {
    const [jobsResult, translationResult] = await Promise.all([
      client.from('jobs').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      client.from('job_translations').select('*'),
    ]);
    if (!jobsResult.error && !translationResult.error && jobsResult.data) {
      return jobsResult.data.map((job) => mergeJob(job, (translationResult.data ?? []).filter((row) => row.job_id === job.id), locale));
    }
  }
  return localJobs.slice().sort((a, b) => a.sort_order - b.sort_order).map((job) => mergeJob(job, localJobTranslations.filter((row) => row.job_id === job.id), locale));
}

export async function getAdminJobInput(id: string) {
  const client = await getServerClient();
  if (client) {
    const [jobResult, translationResult] = await Promise.all([
      client.from('jobs').select('*').eq('id', id).maybeSingle(),
      client.from('job_translations').select('*').eq('job_id', id),
    ]);
    if (!jobResult.error && !translationResult.error && jobResult.data) {
      const vi = translationResult.data.find((row) => row.locale === 'vi');
      const en = translationResult.data.find((row) => row.locale === 'en');
      if (vi && en) return {
        slug: jobResult.data.slug,
        employmentType: jobResult.data.employment_type,
        location: jobResult.data.location,
        isRemote: jobResult.data.is_remote,
        titleVi: vi.title,
        titleEn: en.title,
        summaryVi: vi.summary,
        summaryEn: en.summary,
        descriptionVi: vi.description,
        descriptionEn: en.description,
        requirementsVi: vi.requirements,
        requirementsEn: en.requirements,
        isPublished: jobResult.data.is_published,
      };
    }
  }
  const job = localJobs.find((item) => item.id === id);
  if (!job) return null;
  const vi = localJobTranslations.find((row) => row.job_id === id && row.locale === 'vi');
  const en = localJobTranslations.find((row) => row.job_id === id && row.locale === 'en');
  if (!vi || !en) return null;
  return {
    slug: job.slug,
    employmentType: job.employment_type,
    location: job.location,
    isRemote: job.is_remote,
    titleVi: vi.title,
    titleEn: en.title,
    summaryVi: vi.summary,
    summaryEn: en.summary,
    descriptionVi: vi.description,
    descriptionEn: en.description,
    requirementsVi: vi.requirements,
    requirementsEn: en.requirements,
    isPublished: job.is_published,
  };
}

export async function getJobApplications(): Promise<JobApplicationView[]> {
  const client = await getServerClient();
  if (!client) return [];
  const [applicationsResult, jobsResult, translationsResult] = await Promise.all([
    client.from('job_applications').select('*').order('created_at', { ascending: false }),
    client.from('jobs').select('*'),
    client.from('job_translations').select('*').eq('locale', 'en'),
  ]);
  if (applicationsResult.error || jobsResult.error || translationsResult.error) return [];
  return (applicationsResult.data ?? []).map((application) => ({
    id: application.id,
    jobId: application.job_id,
    jobTitle: translationsResult.data?.find((translation) => translation.job_id === application.job_id)?.title
      ?? jobsResult.data?.find((job) => job.id === application.job_id)?.slug
      ?? application.job_id,
    name: application.name,
    email: application.email,
    phone: application.phone ?? '',
    portfolioUrl: application.portfolio_url ?? '',
    coverNote: application.cover_note,
    cvPath: application.cv_path,
    cvFilename: application.cv_filename,
    cvContentType: application.cv_content_type,
    cvSize: application.cv_size,
    locale: application.locale,
    status: application.status,
    createdAt: application.created_at,
  }));
}

export { mergeJob };
