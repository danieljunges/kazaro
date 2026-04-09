-- Fotos de portfólio do trabalho (perfil público)
create table if not exists public.pro_portfolio_photos (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_pro_portfolio_pro_sort on public.pro_portfolio_photos (professional_id, sort_order);

alter table public.pro_portfolio_photos enable row level security;

drop policy if exists "pro_portfolio_public_read" on public.pro_portfolio_photos;
create policy "pro_portfolio_public_read" on public.pro_portfolio_photos for select using (true);

drop policy if exists "pro_portfolio_insert_own" on public.pro_portfolio_photos;
create policy "pro_portfolio_insert_own" on public.pro_portfolio_photos
  for insert with check (
    auth.uid() is not null
    and professional_id = auth.uid()
    and exists (select 1 from public.professionals p where p.id = professional_id and p.id = auth.uid())
  );

drop policy if exists "pro_portfolio_update_own" on public.pro_portfolio_photos;
create policy "pro_portfolio_update_own" on public.pro_portfolio_photos
  for update using (professional_id = auth.uid());

drop policy if exists "pro_portfolio_delete_own" on public.pro_portfolio_photos;
create policy "pro_portfolio_delete_own" on public.pro_portfolio_photos
  for delete using (professional_id = auth.uid());

-- Bucket público; pasta = user id (igual avatars)
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

drop policy if exists "portfolio_public_read" on storage.objects;
create policy "portfolio_public_read" on storage.objects for select using (bucket_id = 'portfolio');

drop policy if exists "portfolio_owner_write" on storage.objects;
create policy "portfolio_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'portfolio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "portfolio_owner_update" on storage.objects;
create policy "portfolio_owner_update" on storage.objects
  for update using (
    bucket_id = 'portfolio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "portfolio_owner_delete" on storage.objects;
create policy "portfolio_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'portfolio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
