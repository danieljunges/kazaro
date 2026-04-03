-- Avaliações reais após agendamento concluído (1–5 estrelas + comentário).
-- Atualiza professionals.rating_avg e professionals.reviews_count automaticamente.

create table if not exists public.booking_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  stars smallint not null check (stars >= 1 and stars <= 5),
  comment text,
  author_public_name text not null default 'Cliente verificado',
  created_at timestamptz not null default now(),
  constraint booking_reviews_comment_len check (comment is null or char_length(trim(comment)) <= 2000),
  constraint booking_reviews_one_per_booking unique (booking_id)
);

create index if not exists idx_booking_reviews_prof_time on public.booking_reviews (professional_id, created_at desc);
create index if not exists idx_booking_reviews_client on public.booking_reviews (client_id);

alter table public.booking_reviews enable row level security;

drop policy if exists "booking_reviews_select_all" on public.booking_reviews;
create policy "booking_reviews_select_all" on public.booking_reviews
  for select using (true);

drop policy if exists "booking_reviews_insert_client" on public.booking_reviews;
create policy "booking_reviews_insert_client" on public.booking_reviews
  for insert with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.client_id = auth.uid()
        and b.status = 'completed'
        and b.professional_id = booking_reviews.professional_id
    )
  );

-- Recalcula média e total no perfil do prestador
create or replace function public.refresh_professional_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
begin
  if tg_op = 'DELETE' then
    pid := old.professional_id;
  else
    pid := new.professional_id;
  end if;

  update public.professionals p
  set
    reviews_count = coalesce(
      (select count(*)::int from public.booking_reviews r where r.professional_id = pid),
      0
    ),
    rating_avg = (
      select case
        when count(*) = 0 then null
        else round(avg(r.stars)::numeric, 1)
      end
      from public.booking_reviews r
      where r.professional_id = pid
    )
  where p.id = pid;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_booking_reviews_refresh on public.booking_reviews;
create trigger trg_booking_reviews_refresh
  after insert or update or delete on public.booking_reviews
  for each row execute procedure public.refresh_professional_review_stats();

-- Remove notas fictícias de quem ainda não tem avaliação real
update public.professionals p
set
  reviews_count = 0,
  rating_avg = null
where not exists (select 1 from public.booking_reviews r where r.professional_id = p.id);
