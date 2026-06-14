-- Connectoo storage buckets and storage.objects RLS policies.
-- File paths must start with the auth user id, for example:
-- avatars/{user_id}/profile.jpg
-- verification-documents/{user_id}/license.pdf

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'verification-documents',
    'verification-documents',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "verification_documents_owner_insert" on storage.objects;
create policy "verification_documents_owner_insert"
on storage.objects for insert
with check (
  bucket_id = 'verification-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "verification_documents_owner_select" on storage.objects;
create policy "verification_documents_owner_select"
on storage.objects for select
using (
  bucket_id = 'verification-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "verification_documents_admin_select" on storage.objects;
create policy "verification_documents_admin_select"
on storage.objects for select
using (
  bucket_id = 'verification-documents'
  and public.is_admin()
);

drop policy if exists "verification_documents_admin_delete" on storage.objects;
create policy "verification_documents_admin_delete"
on storage.objects for delete
using (
  bucket_id = 'verification-documents'
  and public.is_admin()
);
