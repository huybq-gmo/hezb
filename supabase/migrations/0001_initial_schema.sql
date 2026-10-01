-- Hezb initial schema. Apply with Supabase CLI; do not edit after it is applied.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_vi text not null check (length(trim(name_vi)) > 0),
  name_en text not null check (length(trim(name_en)) > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  category_id uuid references public.categories(id) on delete set null,
  client_name text,
  year integer check (year between 2000 and 2100),
  tech text[] not null default '{}',
  cover_url text,
  gallery text[] not null default '{}',
  website_url text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint projects_website_url check (website_url is null or website_url ~* '^https?://')
);

create table public.project_translations (
  project_id uuid not null references public.projects(id) on delete cascade,
  locale text not null check (locale in ('vi', 'en')),
  title text not null check (length(trim(title)) > 0),
  summary text not null check (length(trim(summary)) > 0),
  content text not null default '',
  result text not null default '',
  primary key (project_id, locale)
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  avatar_url text,
  linkedin_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint members_linkedin_url check (linkedin_url is null or linkedin_url ~* '^https?://')
);

create table public.member_translations (
  member_id uuid not null references public.members(id) on delete cascade,
  locale text not null check (locale in ('vi', 'en')),
  name text not null check (length(trim(name)) > 0),
  role text not null check (length(trim(role)) > 0),
  bio text not null default '',
  primary key (member_id, locale)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  company text,
  phone text,
  topic text not null check (topic in ('ai', 'custom_software', 'automation', 'other')),
  message text not null check (length(trim(message)) between 5 and 5000),
  locale text not null default 'vi' check (locale in ('vi', 'en')),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Keep PostgREST table privileges explicit; RLS below still controls each row.
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.projects, public.project_translations,
  public.members, public.member_translations to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, insert, update, delete on public.categories, public.projects,
  public.project_translations, public.members, public.member_translations,
  public.contact_messages, public.admins to authenticated;

create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger members_set_updated_at before update on public.members
for each row execute function public.set_updated_at();
create trigger contact_messages_set_updated_at before update on public.contact_messages
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_translations enable row level security;
alter table public.members enable row level security;
alter table public.member_translations enable row level security;
alter table public.contact_messages enable row level security;
alter table public.admins enable row level security;

create policy categories_public_read on public.categories
for select to anon, authenticated using (true);
create policy categories_admin_write on public.categories
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy projects_public_read on public.projects
for select to anon, authenticated using (is_published = true);
create policy projects_admin_all on public.projects
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy project_translations_public_read on public.project_translations
for select to anon, authenticated using (
  exists (select 1 from public.projects p where p.id = project_id and p.is_published = true)
);
create policy project_translations_admin_all on public.project_translations
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy members_public_read on public.members
for select to anon, authenticated using (is_published = true);
create policy members_admin_all on public.members
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy member_translations_public_read on public.member_translations
for select to anon, authenticated using (
  exists (select 1 from public.members m where m.id = member_id and m.is_published = true)
);
create policy member_translations_admin_all on public.member_translations
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy contact_messages_public_insert on public.contact_messages
for insert to anon, authenticated with check (true);
create policy contact_messages_admin_all on public.contact_messages
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy admins_self_read on public.admins
for select to authenticated using (id = (select auth.uid()));
create policy admins_admin_all on public.admins
for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true), ('member-media', 'member-media', true)
on conflict (id) do update set public = excluded.public;

create policy project_media_public_read on storage.objects
for select to anon, authenticated using (bucket_id = 'project-media');
create policy member_media_public_read on storage.objects
for select to anon, authenticated using (bucket_id = 'member-media');
create policy project_media_admin_insert on storage.objects
for insert to authenticated with check (bucket_id = 'project-media' and public.is_admin());
create policy project_media_admin_update on storage.objects
for update to authenticated using (bucket_id = 'project-media' and public.is_admin()) with check (bucket_id = 'project-media' and public.is_admin());
create policy project_media_admin_delete on storage.objects
for delete to authenticated using (bucket_id = 'project-media' and public.is_admin());
create policy member_media_admin_insert on storage.objects
for insert to authenticated with check (bucket_id = 'member-media' and public.is_admin());
create policy member_media_admin_update on storage.objects
for update to authenticated using (bucket_id = 'member-media' and public.is_admin()) with check (bucket_id = 'member-media' and public.is_admin());
create policy member_media_admin_delete on storage.objects
for delete to authenticated using (bucket_id = 'member-media' and public.is_admin());
