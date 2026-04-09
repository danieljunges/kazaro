-- Áreas de atuação (filtro /search + vitrine) e foto pública do perfil
alter table public.professionals
  add column if not exists focus_category_keys text[] not null default '{}';

alter table public.professionals
  add column if not exists avatar_public_url text;

comment on column public.professionals.focus_category_keys is 'Chaves alinhadas a lib/services/category-catalog (barbearia, nails, …).';
comment on column public.professionals.avatar_public_url is 'URL pública da foto (espelho de profiles.avatar_url para leitura anônima).';
