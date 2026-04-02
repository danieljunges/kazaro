-- Propostas / Orçamentos dentro da conversa

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0 and amount_cents <= 100000000),
  currency text not null default 'BRL',
  title text,
  description text,
  status text not null default 'sent' check (status in ('sent','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_proposals_conv_time on public.proposals (conversation_id, created_at desc);
create index if not exists idx_proposals_status on public.proposals (status);

alter table public.proposals enable row level security;

-- participants can read
drop policy if exists "proposals_select_parties" on public.proposals;
create policy "proposals_select_parties" on public.proposals
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.client_id or auth.uid() = c.professional_id)
    )
  );

-- only the professional of the conversation can create a proposal
drop policy if exists "proposals_insert_professional" on public.proposals;
create policy "proposals_insert_professional" on public.proposals
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and auth.uid() = c.professional_id
    )
  );

-- professional can cancel; client can accept/decline (only when sent)
drop policy if exists "proposals_update_parties" on public.proposals;
create policy "proposals_update_parties" on public.proposals
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.client_id or auth.uid() = c.professional_id)
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          -- professional can set cancelled
          (auth.uid() = c.professional_id and status in ('sent','cancelled'))
          -- client can accept/decline
          or (auth.uid() = c.client_id and status in ('accepted','declined'))
        )
    )
  );

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_proposals_updated on public.proposals;
create trigger trg_proposals_updated
  before update on public.proposals
  for each row execute procedure public.set_updated_at();

