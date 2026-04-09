-- Onde o serviço acontece: até o cliente, no espaço do profissional, ou ambos.

alter table public.pro_services
  add column if not exists attendance_mode text;

update public.pro_services
set attendance_mode = 'at_venue'
where attendance_mode is null;

alter table public.pro_services
  alter column attendance_mode set default 'at_venue';

alter table public.pro_services
  alter column attendance_mode set not null;

alter table public.pro_services
  drop constraint if exists pro_services_attendance_mode_check;

alter table public.pro_services
  add constraint pro_services_attendance_mode_check
  check (attendance_mode in ('at_client', 'at_venue', 'both'));

comment on column public.pro_services.attendance_mode is
  'at_client = deslocamento até o cliente; at_venue = presencial no espaço do profissional; both = cliente escolhe no agendamento.';
