-- Jornada de trabalho do prestador, duração de serviço/slot, preço obrigatório em serviço aprovado,
-- e funções SECURITY DEFINER para listar horários livres e validar conflito (RLS não expõe outros pedidos).

-- 1) Profissionais: grade de trabalho (interpretada em America/Sao_Paulo)
alter table public.professionals
  add column if not exists work_day_start time not null default time '08:00',
  add column if not exists work_day_end time not null default time '18:00',
  add column if not exists work_weekdays smallint[] not null default array[1, 2, 3, 4, 5]::smallint[],
  add column if not exists booking_slot_step_minutes int not null default 60
    constraint professionals_booking_slot_step_check check (booking_slot_step_minutes >= 30 and booking_slot_step_minutes <= 240),
  add column if not exists booking_default_duration_minutes int not null default 120
    constraint professionals_booking_default_dur_check check (booking_default_duration_minutes >= 15 and booking_default_duration_minutes <= 600);

comment on column public.professionals.work_day_start is 'Início do expediente (hora local America/Sao_Paulo).';
comment on column public.professionals.work_day_end is 'Fim do expediente (hora local).';
comment on column public.professionals.work_weekdays is 'Dias úteis ISO: 1=seg … 7=dom.';
comment on column public.professionals.booking_slot_step_minutes is 'Intervalo entre inícios de slot ofertados (ex.: 60 = de hora em hora).';
comment on column public.professionals.booking_default_duration_minutes is 'Duração padrão de reserva quando o serviço não define outra.';

-- 2) Serviços: duração estimada do trabalho (bloqueio de agenda)
alter table public.pro_services
  add column if not exists duration_minutes int not null default 120
    constraint pro_services_duration_check check (duration_minutes >= 15 and duration_minutes <= 600);

comment on column public.pro_services.duration_minutes is 'Quanto tempo o slot ocupa na agenda deste prestador.';

-- 3) Pedidos: cópia da duração no momento do agendamento
alter table public.bookings
  add column if not exists duration_minutes_snapshot int not null default 120
    constraint bookings_duration_snapshot_check check (duration_minutes_snapshot >= 15 and duration_minutes_snapshot <= 600);

comment on column public.bookings.duration_minutes_snapshot is 'Duração usada para conflito de horário e exibição.';

-- 4) Backfill preço em serviços aprovados sem valor
update public.pro_services ps
set price_cents = coalesce(p.price_from_cents, 5000)
from public.professionals p
where ps.professional_id = p.id
  and ps.status = 'approved'
  and (ps.price_cents is null or ps.price_cents < 50);

update public.pro_services
set price_cents = 5000
where status = 'approved'
  and (price_cents is null or price_cents < 50);

-- 5) Serviço aprovado exige preço mínimo (centavos) alinhado ao checkout
alter table public.pro_services drop constraint if exists pro_services_approved_price_check;
alter table public.pro_services
  add constraint pro_services_approved_price_check check (
    status is distinct from 'approved'
    or (price_cents is not null and price_cents >= 50)
  );

-- 6) Slots disponíveis (sem conflito com pedidos ativos)
create or replace function public.kazaro_booking_slots(
  p_professional_id uuid,
  p_date text,
  p_duration_minutes int
)
returns text[]
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  d date;
  dow smallint;
  ws time;
  we time;
  wdays smallint[];
  step_m int;
  def_dur int;
  slot_dur int;
  day_start timestamptz;
  day_end_limit timestamptz;
  cand_start timestamptz;
  cand_end timestamptz;
  slots text[] := array[]::text[];
  hhmi text;
  busy boolean;
begin
  if p_date is null or p_date !~ '^\d{4}-\d{2}-\d{2}$' then
    return array[]::text[];
  end if;

  d := p_date::date;
  dow := extract(isodow from d)::smallint;

  slot_dur := coalesce(nullif(p_duration_minutes, 0), 120);
  if slot_dur < 15 then slot_dur := 15; end if;
  if slot_dur > 600 then slot_dur := 600; end if;

  select
    work_day_start,
    work_day_end,
    work_weekdays,
    booking_slot_step_minutes,
    booking_default_duration_minutes
  into ws, we, wdays, step_m, def_dur
  from public.professionals
  where id = p_professional_id;

  if not found then
    return array[]::text[];
  end if;

  if wdays is null or coalesce(array_length(wdays, 1), 0) = 0 then
    return array[]::text[];
  end if;

  if not (dow = any (wdays)) then
    return array[]::text[];
  end if;

  day_start := (d::text || ' ' || ws::text)::timestamp at time zone 'America/Sao_Paulo';
  day_end_limit := (d::text || ' ' || we::text)::timestamp at time zone 'America/Sao_Paulo';

  if day_end_limit <= day_start then
    return array[]::text[];
  end if;

  cand_start := day_start;
  while cand_start + (slot_dur || ' minutes')::interval <= day_end_limit loop
    cand_end := cand_start + (slot_dur || ' minutes')::interval;

    select exists (
      select 1
      from public.bookings b
      where b.professional_id = p_professional_id
        and b.status not in ('cancelled', 'archived')
        and tstzrange(
          b.scheduled_at,
          b.scheduled_at + (coalesce(b.duration_minutes_snapshot, 120) || ' minutes')::interval,
          '[)'
        )
        && tstzrange(cand_start, cand_end, '[)')
    ) into busy;

    if not busy then
      hhmi := to_char(cand_start at time zone 'America/Sao_Paulo', 'HH24:MI');
      slots := array_append(slots, hhmi);
    end if;

    cand_start := cand_start + (step_m || ' minutes')::interval;
  end loop;

  return slots;
end;
$$;

-- 7) Livre no instante (anti corrida no submit)
create or replace function public.kazaro_booking_slot_free(
  p_professional_id uuid,
  p_scheduled_at timestamptz,
  p_duration_minutes int
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.bookings b
    where b.professional_id = p_professional_id
      and b.status not in ('cancelled', 'archived')
      and tstzrange(
        b.scheduled_at,
        b.scheduled_at + (coalesce(b.duration_minutes_snapshot, 120) || ' minutes')::interval,
        '[)'
      )
      && tstzrange(
        p_scheduled_at,
        p_scheduled_at + (greatest(15, least(600, coalesce(p_duration_minutes, 120))) || ' minutes')::interval,
        '[)'
      )
  );
$$;

revoke all on function public.kazaro_booking_slots(uuid, text, int) from public;
grant execute on function public.kazaro_booking_slots(uuid, text, int) to authenticated;

revoke all on function public.kazaro_booking_slot_free(uuid, timestamptz, int) from public;
grant execute on function public.kazaro_booking_slot_free(uuid, timestamptz, int) to authenticated;
