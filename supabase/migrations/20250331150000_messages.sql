-- Mensagens (conversas entre cliente e prestador)

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  constraint conversations_no_self check (professional_id <> client_id)
);

create unique index if not exists conversations_unique_pair
  on public.conversations (professional_id, client_id);

create index if not exists idx_conversations_prof on public.conversations (professional_id);
create index if not exists idx_conversations_client on public.conversations (client_id);
create index if not exists idx_conversations_last on public.conversations (last_message_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conv_time on public.messages (conversation_id, created_at desc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- conversas: participantes podem ver
drop policy if exists "conversations_select_parties" on public.conversations;
create policy "conversations_select_parties" on public.conversations
  for select using (auth.uid() = client_id or auth.uid() = professional_id);

-- conversas: cliente cria (upsert via unique pair)
drop policy if exists "conversations_insert_client" on public.conversations;
create policy "conversations_insert_client" on public.conversations
  for insert with check (auth.uid() = client_id and auth.uid() <> professional_id);

-- conversas: prestador ou cliente pode atualizar last_message_at
drop policy if exists "conversations_update_parties" on public.conversations;
create policy "conversations_update_parties" on public.conversations
  for update using (auth.uid() = client_id or auth.uid() = professional_id);

-- mensagens: participantes podem ver
drop policy if exists "messages_select_parties" on public.messages;
create policy "messages_select_parties" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.client_id or auth.uid() = c.professional_id)
    )
  );

-- mensagens: só o próprio remetente insere, e precisa ser participante
drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.client_id or auth.uid() = c.professional_id)
    )
  );

-- Mantém last_message_at atualizado automaticamente
create or replace function public.bump_conversation_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set last_message_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_bump_conversation_last_message on public.messages;
create trigger trg_bump_conversation_last_message
  after insert on public.messages
  for each row execute procedure public.bump_conversation_last_message();

