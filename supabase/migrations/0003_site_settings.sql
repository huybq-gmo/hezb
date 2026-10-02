-- Public contact information managed from the admin workspace.
-- Apply after 0001_initial_schema.sql and 0002_careers.sql.

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text not null,
  address_vi text not null,
  address_en text not null,
  response_time_vi text not null,
  response_time_en text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

create policy site_settings_public_read on public.site_settings
for select to anon, authenticated using (true);

create policy site_settings_admin_all on public.site_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (id, email, phone, address_vi, address_en, response_time_vi, response_time_en)
values (1, 'hello@hezb.example', '+84 000 000 000', 'Thành phố Hồ Chí Minh, Việt Nam', 'Ho Chi Minh City, Vietnam', 'Trong 1 ngày làm việc', 'Within 1 business day')
on conflict (id) do nothing;
