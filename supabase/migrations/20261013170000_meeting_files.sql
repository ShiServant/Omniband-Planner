-- Meeting file attachments. Run this in the Supabase SQL editor.

create table meeting_files (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings (id) on delete cascade,
  file_name text not null,
  content_type text,
  content_base64 text not null,
  created_at timestamptz not null default now(),
  constraint meeting_files_name_not_blank check (length(btrim(file_name)) > 0)
);

create index meeting_files_meeting_id_idx on meeting_files (meeting_id, created_at);

alter table meeting_files enable row level security;
alter table meeting_files force row level security;
revoke all on table meeting_files from public, anon, authenticated;
grant select on table meeting_files to anon;
create policy meeting_files_public_read
  on meeting_files
  for select
  to anon
  using (true);

notify pgrst, 'reload schema';
