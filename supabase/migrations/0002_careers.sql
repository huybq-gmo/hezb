-- Careers and candidate applications. Apply after 0001_initial_schema.sql.

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  employment_type text not null default 'full_time' check (employment_type in ('full_time', 'part_time', 'contract', 'internship')),
  location text not null default 'Ho Chi Minh City / Remote',
  is_remote boolean not null default true,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.job_translations (
  job_id uuid not null references public.jobs(id) on delete cascade,
  locale text not null check (locale in ('vi', 'en')),
  title text not null check (length(trim(title)) > 0),
  summary text not null check (length(trim(summary)) > 0),
  description text not null default '',
  requirements text not null default '',
  primary key (job_id, locale)
);

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 120),
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text,
  portfolio_url text check (portfolio_url is null or portfolio_url ~* '^https?://'),
  cover_note text not null check (length(trim(cover_note)) between 10 and 5000),
  cv_path text not null check (cv_path ~ '^incoming/[a-zA-Z0-9._/-]+$'),
  cv_filename text not null,
  cv_content_type text not null check (cv_content_type in ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  cv_size integer not null check (cv_size between 1 and 5242880),
  locale text not null default 'vi' check (locale in ('vi', 'en')),
  status text not null default 'new' check (status in ('new', 'reviewing', 'shortlisted', 'rejected', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index jobs_public_order on public.jobs (is_published, sort_order, created_at desc);
create index job_applications_job_order on public.job_applications (job_id, created_at desc);
create index job_applications_status_order on public.job_applications (status, created_at desc);

create trigger jobs_set_updated_at before update on public.jobs
for each row execute function public.set_updated_at();
create trigger job_applications_set_updated_at before update on public.job_applications
for each row execute function public.set_updated_at();

alter table public.jobs enable row level security;
alter table public.job_translations enable row level security;
alter table public.job_applications enable row level security;

grant select on public.jobs, public.job_translations to anon, authenticated;
grant insert on public.job_applications to anon, authenticated;
grant select, insert, update, delete on public.jobs, public.job_translations, public.job_applications to authenticated;

create policy jobs_public_read on public.jobs
for select to anon, authenticated using (is_published = true);
create policy jobs_admin_all on public.jobs
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy job_translations_public_read on public.job_translations
for select to anon, authenticated using (
  exists (select 1 from public.jobs j where j.id = job_id and j.is_published = true)
);
create policy job_translations_admin_all on public.job_translations
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy job_applications_public_insert on public.job_applications
for insert to anon, authenticated with check (
  exists (select 1 from public.jobs j where j.id = job_id and j.is_published = true)
);
create policy job_applications_admin_all on public.job_applications
for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('candidate-cvs', 'candidate-cvs', false)
on conflict (id) do update set public = false;

create policy candidate_cv_public_insert on storage.objects
for insert to anon, authenticated with check (
  bucket_id = 'candidate-cvs' and name like 'incoming/%'
);
create policy candidate_cv_admin_read on storage.objects
for select to authenticated using (bucket_id = 'candidate-cvs' and public.is_admin());
create policy candidate_cv_admin_delete on storage.objects
for delete to authenticated using (bucket_id = 'candidate-cvs' and public.is_admin());
