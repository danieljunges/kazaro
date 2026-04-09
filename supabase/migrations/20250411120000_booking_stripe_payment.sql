-- Pagamento online (Stripe Checkout): status e sessão

alter table public.bookings
  add column if not exists payment_status text not null default 'none'
  constraint bookings_payment_status_check check (payment_status in ('none', 'unpaid', 'paid', 'failed'));

alter table public.bookings
  add column if not exists stripe_checkout_session_id text;

comment on column public.bookings.payment_status is
  'none = sem cobrança no app (legado ou serviço sem preço); unpaid/paid/failed = fluxo Stripe.';
comment on column public.bookings.stripe_checkout_session_id is 'Última sessão Stripe Checkout criada para este pedido.';
