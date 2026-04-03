-- Agendamento: prestador marca quando inicia o serviço no local / execução.

alter table public.bookings drop constraint if exists bookings_status_check;

alter table public.bookings add constraint bookings_status_check check (
  status in ('pending', 'confirmed', 'in_progress', 'cancelled', 'completed')
);

alter table public.bookings
  add column if not exists service_started_at timestamptz;

comment on column public.bookings.service_started_at is 'Quando o prestador marcou “serviço em andamento” (in_progress).';
