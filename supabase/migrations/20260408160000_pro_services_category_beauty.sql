-- Repivô do Kazaro: categorias de serviço = estética / barbearia / beleza.
-- Serviços antigos (casa & obra) ficam sem category_key até o profissional recategorizar.

alter table public.pro_services
  drop constraint if exists pro_services_category_key_check;

update public.pro_services
set category_key = null
where category_key in (
  'encanamento',
  'eletrica',
  'limpeza',
  'montagem',
  'pintura',
  'reforma',
  'jardinagem'
);

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
