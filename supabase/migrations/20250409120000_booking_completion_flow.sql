-- Conclusão com foto + marcos temporais para linha do tempo do atendimento

alter table public.bookings
  add column if not exists completion_photo_url text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists completed_at timestamptz;

comment on column public.bookings.completion_photo_url is 'URL pública da foto de comprovação enviada pelo prestador ao concluir.';
comment on column public.bookings.confirmed_at is 'Quando o prestador confirmou o pedido.';
comment on column public.bookings.completed_at is 'Quando o prestador marcou concluído (com foto).';
