-- Admin panel: role 'admin' + políticas de leitura/ação

-- 1) Permite role = admin
do $$
begin
  -- remove constraint antiga (nome pode variar)
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and conname = 'profiles_role_check'
  ) then
    alter table public.profiles drop constraint profiles_role_check;
  end if;
exception when others then
  -- se o nome for diferente, seguimos; próxima linha adiciona nova constraint
end;
$$;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('client', 'professional', 'admin'));

-- 2) Helper: checar se usuário atual é admin
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- 3) Admin policies

-- profiles: admin pode ler todos e atualizar roles
drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select using (public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin());

-- professionals: admin pode ler todos
drop policy if exists "professionals_admin_read" on public.professionals;
create policy "professionals_admin_read" on public.professionals
  for select using (public.is_admin());

-- pro_services: admin pode ler todos e aprovar/rejeitar
drop policy if exists "pro_services_admin_read" on public.pro_services;
create policy "pro_services_admin_read" on public.pro_services
  for select using (public.is_admin());

drop policy if exists "pro_services_admin_update" on public.pro_services;
create policy "pro_services_admin_update" on public.pro_services
  for update using (public.is_admin());

-- bookings: admin pode ler todos
drop policy if exists "bookings_admin_read" on public.bookings;
create policy "bookings_admin_read" on public.bookings
  for select using (public.is_admin());

drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update" on public.bookings
  for update using (public.is_admin());

-- conversations/messages: admin pode ler (para suporte/moderação)
drop policy if exists "conversations_admin_read" on public.conversations;
create policy "conversations_admin_read" on public.conversations
  for select using (public.is_admin());

drop policy if exists "messages_admin_read" on public.messages;
create policy "messages_admin_read" on public.messages
  for select using (public.is_admin());

-- 4) Promove seu usuário (se já existir) para admin
update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id
  and lower(u.email) = lower('daniel@kazaro.app');

