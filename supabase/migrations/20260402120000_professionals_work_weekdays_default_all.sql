-- Fins de semana no padrão: quem não atende sáb/dom desmarca em Configurações.
alter table public.professionals
  alter column work_weekdays set default array[1, 2, 3, 4, 5, 6, 7]::smallint[];

comment on column public.professionals.work_weekdays is
  'Dias ISO 1=seg … 7=dom. Padrão = todos; desmarque dias de folga em Configurações.';
