-- Blog posts, bilingual content, and public media attachments.
-- Apply after 0003_site_settings.sql.

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  author_name text not null default 'Hezb Community' check (length(trim(author_name)) between 1 and 160),
  cover_url text,
  tags text[] not null default '{}',
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint blog_posts_cover_url check (cover_url is null or cover_url ~* '^(/|https?://)')
);

create table public.blog_post_translations (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  locale text not null check (locale in ('vi', 'en')),
  title text not null check (length(trim(title)) between 1 and 180),
  excerpt text not null check (length(trim(excerpt)) between 1 and 500),
  content text not null default '',
  seo_title text,
  seo_description text,
  primary key (post_id, locale)
);

create table public.blog_post_attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  kind text not null check (kind in ('image', 'file')),
  name text not null check (length(trim(name)) between 1 and 180),
  url text not null check (url ~* '^(/|https?://)'),
  content_type text not null,
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index blog_posts_public_order on public.blog_posts (is_published, is_featured, published_at desc, sort_order);
create index blog_post_attachments_post_order on public.blog_post_attachments (post_id, sort_order, created_at);

create trigger blog_posts_set_updated_at before update on public.blog_posts
for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;
alter table public.blog_post_translations enable row level security;
alter table public.blog_post_attachments enable row level security;

grant select on public.blog_posts, public.blog_post_translations, public.blog_post_attachments to anon, authenticated;
grant insert, update, delete on public.blog_posts, public.blog_post_translations, public.blog_post_attachments to authenticated;

create policy blog_posts_public_read on public.blog_posts
for select to anon, authenticated using (is_published = true);
create policy blog_posts_admin_all on public.blog_posts
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy blog_post_translations_public_read on public.blog_post_translations
for select to anon, authenticated using (
  exists (select 1 from public.blog_posts p where p.id = post_id and p.is_published = true)
);
create policy blog_post_translations_admin_all on public.blog_post_translations
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy blog_post_attachments_public_read on public.blog_post_attachments
for select to anon, authenticated using (
  exists (select 1 from public.blog_posts p where p.id = post_id and p.is_published = true)
);
create policy blog_post_attachments_admin_all on public.blog_post_attachments
for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do update set public = excluded.public;

create policy blog_media_public_read on storage.objects
for select to anon, authenticated using (bucket_id = 'blog-media');
create policy blog_media_admin_insert on storage.objects
for insert to authenticated with check (bucket_id = 'blog-media' and public.is_admin());
create policy blog_media_admin_update on storage.objects
for update to authenticated using (bucket_id = 'blog-media' and public.is_admin()) with check (bucket_id = 'blog-media' and public.is_admin());
create policy blog_media_admin_delete on storage.objects
for delete to authenticated using (bucket_id = 'blog-media' and public.is_admin());
