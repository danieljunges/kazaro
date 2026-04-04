-- Prestador pode arquivar pedido a qualquer momento (sai dos “ativos”, mantém histórico)

alter table public.bookings
  add column if not exists archived_at timestamptz;

comment on column public.bookings.archived_at is 'Quando o prestador arquivou o pedido (fora da lista de ativos).';

alter table public.bookings drop constraint if exists bookings_status_check;

alter table public.bookings add constraint bookings_status_check check (
  status in ('pending', 'confirmed', 'in_progress', 'cancelled', 'completed', 'archived')
);
