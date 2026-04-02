-- Ganhos (snapshots de valor para somar por período)

alter table public.bookings
  add column if not exists service_price_cents_snapshot int;

alter table public.bookings
  add column if not exists final_price_cents int;

-- Se final_price_cents não for preenchido, o snapshot serve como base.

