-- Fotos de conclusão: /<user_id>/<booking_id>/arquivo (mesmo padrão de permissão que avatars)

insert into storage.buckets (id, name, public)
values ('booking-proofs', 'booking-proofs', true)
on conflict (id) do update set public = true;

drop policy if exists "booking_proofs_public_read" on storage.objects;
create policy "booking_proofs_public_read"
on storage.objects for select
using (bucket_id = 'booking-proofs');

drop policy if exists "booking_proofs_owner_write" on storage.objects;
create policy "booking_proofs_owner_write"
on storage.objects for insert
with check (
  bucket_id = 'booking-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "booking_proofs_owner_update" on storage.objects;
create policy "booking_proofs_owner_update"
on storage.objects for update
using (
  bucket_id = 'booking-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "booking_proofs_owner_delete" on storage.objects;
create policy "booking_proofs_owner_delete"
on storage.objects for delete
using (
  bucket_id = 'booking-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);
