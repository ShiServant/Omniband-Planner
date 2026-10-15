-- File attachments for projects and tasks. Run this in the Supabase SQL editor.

create table project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  file_name text not null,
  content_type text,
  content_base64 text not null,
  created_at timestamptz not null default now(),
  constraint project_files_name_not_blank check (length(btrim(file_name)) > 0)
);

create index project_files_project_id_idx on project_files (project_id, created_at);

alter table project_files enable row level security;
alter table project_files force row level security;
revoke all on table project_files from public, anon, authenticated;
grant select on table project_files to anon;
create policy project_files_public_read
  on project_files
  for select
  to anon
  using (true);

create table task_files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks (id) on delete cascade,
  file_name text not null,
  content_type text,
  content_base64 text not null,
  created_at timestamptz not null default now(),
  constraint task_files_name_not_blank check (length(btrim(file_name)) > 0)
);

create index task_files_task_id_idx on task_files (task_id, created_at);

alter table task_files enable row level security;
alter table task_files force row level security;
revoke all on table task_files from public, anon, authenticated;
grant select on task_files to anon;
create policy task_files_public_read
  on task_files
  for select
  to anon
  using (true);

notify pgrst, 'reload schema';
