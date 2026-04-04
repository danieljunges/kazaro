-- Local informado pelo cliente no pedido de agendamento (snapshot no pedido)

alter table public.bookings
  add column if not exists client_location_snapshot text;

comment on column public.bookings.client_location_snapshot is 'Endereço/bairro/referência onde o cliente quer o serviço (texto livre no envio).';
