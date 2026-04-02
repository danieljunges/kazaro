-- Aprovação de serviços (pendente → aprovado)

alter table public.pro_services
  add column if not exists status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'));

alter table public.pro_services
  add column if not exists reviewed_at timestamptz;

alter table public.pro_services
  add column if not exists reviewer_note text;

-- Pública: só lê aprovados
drop policy if exists "pro_services_public_read" on public.pro_services;
create policy "pro_services_public_read" on public.pro_services
  for select using (status = 'approved');

-- Dono: lê todos os seus
drop policy if exists "pro_services_owner_read" on public.pro_services;
create policy "pro_services_owner_read" on public.pro_services
  for select using (
    exists (
      select 1 from public.professionals p
      where p.id = professional_id and p.id = auth.uid()
    )
  );

-- Owner CRUD: mantém o comportamento do schema inicial
drop policy if exists "pro_services_insert_own" on public.pro_services;
create policy "pro_services_insert_own" on public.pro_services
  for insert with check (
    exists (
      select 1 from public.professionals p
      where p.id = professional_id and p.id = auth.uid()
    )
  );

drop policy if exists "pro_services_update_own" on public.pro_services;
create policy "pro_services_update_own" on public.pro_services
  for update using (
    exists (
      select 1 from public.professionals p
      where p.id = professional_id and p.id = auth.uid()
    )
  );

drop policy if exists "pro_services_delete_own" on public.pro_services;
create policy "pro_services_delete_own" on public.pro_services
  for delete using (
    exists (
      select 1 from public.professionals p
      where p.id = professional_id and p.id = auth.uid()
    )
  );

