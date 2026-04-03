-- Suporte: tickets + mensagens (usuário ↔ admin). E-mail de resposta via app (Resend).

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_tickets_subject_len check (char_length(trim(subject)) between 1 and 200)
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  author_role text not null check (author_role in ('user', 'admin')),
  body text not null,
  created_at timestamptz not null default now(),
  constraint support_messages_body_len check (char_length(trim(body)) between 1 and 8000)
);

create index if not exists idx_support_tickets_user on public.support_tickets (user_id);
create index if not exists idx_support_tickets_status on public.support_tickets (status);
create index if not exists idx_support_messages_ticket on public.support_messages (ticket_id);

drop trigger if exists trg_support_tickets_updated on public.support_tickets;
create trigger trg_support_tickets_updated
  before update on public.support_tickets
  for each row execute procedure public.set_updated_at();

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "support_tickets_select_own" on public.support_tickets;
create policy "support_tickets_select_own" on public.support_tickets
  for select using (auth.uid() = user_id);

drop policy if exists "support_tickets_insert_own" on public.support_tickets;
create policy "support_tickets_insert_own" on public.support_tickets
  for insert with check (auth.uid() = user_id);

drop policy if exists "support_tickets_update_own" on public.support_tickets;
create policy "support_tickets_update_own" on public.support_tickets
  for update using (auth.uid() = user_id);

drop policy if exists "support_tickets_select_admin" on public.support_tickets;
create policy "support_tickets_select_admin" on public.support_tickets
  for select using (public.is_admin());

drop policy if exists "support_tickets_update_admin" on public.support_tickets;
create policy "support_tickets_update_admin" on public.support_tickets
  for update using (public.is_admin());

drop policy if exists "support_messages_select" on public.support_messages;
create policy "support_messages_select" on public.support_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and (t.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "support_messages_insert_user" on public.support_messages;
create policy "support_messages_insert_user" on public.support_messages
  for insert with check (
    author_role = 'user'
    and author_id = auth.uid()
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and t.user_id = auth.uid() and t.status = 'open'
    )
  );

drop policy if exists "support_messages_insert_admin" on public.support_messages;
create policy "support_messages_insert_admin" on public.support_messages
  for insert with check (
    author_role = 'admin'
    and author_id = auth.uid()
    and public.is_admin()
    and exists (select 1 from public.support_tickets t where t.id = ticket_id)
  );

-- Atualiza updated_at do ticket quando chega nova mensagem
create or replace function public.touch_support_ticket_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.support_tickets set updated_at = now() where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists trg_support_msg_touch_ticket on public.support_messages;
create trigger trg_support_msg_touch_ticket
  after insert on public.support_messages
  for each row execute procedure public.touch_support_ticket_updated_at();
