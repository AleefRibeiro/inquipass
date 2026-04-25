drop policy if exists "passport_documents_insert_anon" on storage.objects;

create policy "passport_documents_insert_anon"
on storage.objects for insert
to anon
with check (bucket_id = 'passport-documents');
