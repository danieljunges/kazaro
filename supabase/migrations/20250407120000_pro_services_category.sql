-- Categoria por serviço (área de atuação) + no máximo 1 serviço pendente/aprovado por categoria por prestador

alter table public.pro_services
  add column if not exists category_key text;

alter table public.pro_services
  drop constraint if exists pro_services_category_key_check;

alter table public.pro_services
  add constraint pro_services_category_key_check
  check (
    category_key is null
    or category_key in (
      'encanamento',
      'eletrica',
      'limpeza',
      'montagem',
      'pintura',
      'reforma',
      'jardinagem'
    )
  );

create unique index if not exists pro_services_prof_category_active_idx
  on public.pro_services (professional_id, category_key)
  where category_key is not null
    and status in ('pending', 'approved');
