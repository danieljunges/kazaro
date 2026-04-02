-- Guardar e-mail (cópia) em profiles para e-mails transacionais
-- (o e-mail real continua sendo auth.users.email; aqui é pra facilitar consultas/RLS no app)

alter table public.profiles
  add column if not exists email text;

-- Backfill para usuários existentes
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and (p.email is null or p.email = '');

-- Atualiza trigger de criação do perfil (insere email)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'client'),
    new.email
  );
  return new;
end;
$$;

