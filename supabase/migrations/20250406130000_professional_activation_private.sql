-- Ativação de prestador: região pública + documento só para o próprio usuário (RLS)

alter table public.professionals
  add column if not exists service_region text;

create table if not exists public.professional_private (
  id uuid primary key references public.profiles (id) on delete cascade,
  tax_document text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_private_tax_len check (char_length(trim(tax_document)) >= 11)
);

drop trigger if exists trg_professional_private_updated on public.professional_private;
create trigger trg_professional_private_updated
  before update on public.professional_private
  for each row execute procedure public.set_updated_at();

alter table public.professional_private enable row level security;

drop policy if exists "professional_private_select_own" on public.professional_private;
create policy "professional_private_select_own"
  on public.professional_private for select
  using (auth.uid() = id);

drop policy if exists "professional_private_insert_own" on public.professional_private;
create policy "professional_private_insert_own"
  on public.professional_private for insert
  with check (auth.uid() = id);

drop policy if exists "professional_private_update_own" on public.professional_private;
create policy "professional_private_update_own"
  on public.professional_private for update
  using (auth.uid() = id);

drop policy if exists "professional_private_delete_own" on public.professional_private;
create policy "professional_private_delete_own"
  on public.professional_private for delete
  using (auth.uid() = id);
