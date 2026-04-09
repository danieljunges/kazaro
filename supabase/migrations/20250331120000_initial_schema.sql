-- Kazaro — schema inicial (rode no Supabase: SQL Editor → New query → colar → Run)
-- Ou: supabase db push (CLI), se usar Supabase local.

-- Perfis (1:1 com auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'client' check (role in ('client', 'professional')),
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dados públicos do prestador (1:1 com profile; id = user id)
create table if not exists public.professionals (
  id uuid primary key references public.profiles (id) on delete cascade,
  slug text unique not null,
  display_name text not null,
  headline text,
  bio text,
  city text default 'Florianópolis',
  neighborhood text,
  is_verified boolean not null default false,
  pro_until timestamptz,
  availability_hint text not null default 'week' check (
    availability_hint in ('today', 'tomorrow', 'week')
  ),
  rating_avg numeric(3, 1) default 4.8,
  reviews_count int not null default 0,
  price_from_cents int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Serviços anunciados pelo prestador
create table if not exists public.pro_services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  name text not null,
  description text,
  price_cents int,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_professionals_slug on public.professionals (slug);
create index if not exists idx_pro_services_prof on public.pro_services (professional_id);

-- ===== updated_at =====
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_professionals_updated on public.professionals;
create trigger trg_professionals_updated
  before update on public.professionals
  for each row execute procedure public.set_updated_at();

-- ===== Novo usuário → linha em profiles =====
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'client')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===== RLS =====
alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.pro_services enable row level security;

-- profiles: cada um vê e edita só o próprio
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- listagem pública (busca) — sem dados sensíveis
drop policy if exists "professionals_public_read" on public.professionals;
create policy "professionals_public_read" on public.professionals
  for select using (true);

drop policy if exists "professionals_insert_own" on public.professionals;
create policy "professionals_insert_own" on public.professionals
  for insert with check (auth.uid() = id);

drop policy if exists "professionals_update_own" on public.professionals;
create policy "professionals_update_own" on public.professionals
  for update using (auth.uid() = id);

drop policy if exists "professionals_delete_own" on public.professionals;
create policy "professionals_delete_own" on public.professionals
  for delete using (auth.uid() = id);

-- serviços: leitura pública; CRUD só do dono
drop policy if exists "pro_services_public_read" on public.pro_services;
create policy "pro_services_public_read" on public.pro_services
  for select using (true);

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
