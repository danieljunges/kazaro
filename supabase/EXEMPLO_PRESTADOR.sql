-- Substitua TODAS as ocorrências de COLE_SEU_USER_UUID_AQUI pelo id de Authentication → Users.
-- Exemplo de UUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890

update public.profiles
set
  role = 'professional',
  full_name = coalesce(nullif(trim(full_name), ''), 'Nome do Prestador')
where id = 'COLE_SEU_USER_UUID_AQUI'::uuid;

insert into public.professionals (
  id,
  slug,
  display_name,
  headline,
  bio,
  city,
  neighborhood,
  is_verified,
  availability_hint,
  rating_avg,
  reviews_count,
  price_from_cents
)
values (
  'COLE_SEU_USER_UUID_AQUI'::uuid,
  'nome-sobrenome-demo',
  'Nome que aparece no site',
  'Barbearia · Trindade',
  'Texto sobre o profissional, estilo de corte e experiência.',
  'Florianópolis',
  'Trindade',
  true,
  'today',
  4.9,
  127,
  4500
)
on conflict (id) do update set
  slug = excluded.slug,
  display_name = excluded.display_name,
  headline = excluded.headline,
  bio = excluded.bio,
  updated_at = now();

-- Só 1 serviço ativo/pendente por category_key por profissional (índice único).
insert into public.pro_services (
  professional_id,
  name,
  description,
  price_cents,
  duration_minutes,
  sort_order,
  category_key,
  attendance_mode
)
values
  (
    'COLE_SEU_USER_UUID_AQUI'::uuid,
    'Corte masculino',
    'Corte na tesoura ou máquina; combo corte + barba combinado no agendamento.',
    4500,
    45,
    0,
    'barbearia',
    'at_venue'
  );
