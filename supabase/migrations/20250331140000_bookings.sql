-- Solicitações de agendamento (cliente → profissional)

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  pro_service_id uuid references public.pro_services (id) on delete set null,
  service_name_snapshot text,
  scheduled_at timestamptz not null,
  client_note text,
  client_name_snapshot text not null,
  client_email_snapshot text,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'cancelled', 'completed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_no_self_book check (client_id <> professional_id)
);

create index if not exists idx_bookings_professional on public.bookings (professional_id);
create index if not exists idx_bookings_client on public.bookings (client_id);
create index if not exists idx_bookings_scheduled on public.bookings (scheduled_at);

drop trigger if exists trg_bookings_updated on public.bookings;
create trigger trg_bookings_updated
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

alter table public.bookings enable row level security;

drop policy if exists "bookings_select_parties" on public.bookings;
create policy "bookings_select_parties" on public.bookings
  for select using (auth.uid() = client_id or auth.uid() = professional_id);

drop policy if exists "bookings_insert_client" on public.bookings;
create policy "bookings_insert_client" on public.bookings
  for insert with check (
    auth.uid() = client_id
    and auth.uid() <> professional_id
  );

drop policy if exists "bookings_update_professional" on public.bookings;
create policy "bookings_update_professional" on public.bookings
  for update using (auth.uid() = professional_id);
