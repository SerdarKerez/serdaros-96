-- SerdarOS 96 — Supabase schema: content table, admin role, RLS, storage bucket.
-- Run once in Supabase Dashboard > SQL Editor. Safe to re-run.

-- 1) Admins ---------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));
-- No insert/update/delete policies: admins are managed only from the SQL Editor (service role).

-- SECURITY DEFINER so RLS policies can call it without exposing the admins table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Site content (one JSONB document per section) -------------------------
create table if not exists public.site_content (
  key        text primary key check (key in ('content', 'labels', 'blog', 'projects')),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.site_content enable row level security;

drop policy if exists "site_content: public read" on public.site_content;
create policy "site_content: public read" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "site_content: admin insert" on public.site_content;
create policy "site_content: admin insert" on public.site_content
  for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "site_content: admin update" on public.site_content;
create policy "site_content: admin update" on public.site_content
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "site_content: admin delete" on public.site_content;
create policy "site_content: admin delete" on public.site_content
  for delete to authenticated using ((select public.is_admin()));

-- 3) Storage: public "media" bucket, admin-only writes ----------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: public read" on storage.objects;
create policy "media: public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

drop policy if exists "media: admin insert" on storage.objects;
create policy "media: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media: admin update" on storage.objects;
create policy "media: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "media: admin delete" on storage.objects;
create policy "media: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));
