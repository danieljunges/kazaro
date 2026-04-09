-- Separação: "lash" → extensão de cílios (`cilios`); nova área `sobrancelha` (design de sobrancelha).
-- Idempotente para quem já aplicou a migration anterior com `lash`.

alter table public.pro_services
  drop constraint if exists pro_services_category_key_check;

update public.pro_services
set category_key = 'cilios'
where category_key = 'lash';

alter table public.pro_services
  add constraint pro_services_category_key_check
  check (
    category_key is null
    or category_key in (
      'barbearia',
      'nails',
      'sobrancelha',
      'cilios',
      'cabelo',
      'maquiagem',
      'tatuagem',
      'podologia'
    )
  );
