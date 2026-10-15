-- Projects keep members only. Tasks can have more than one responsible person.
-- Run this in the Supabase SQL editor.

alter table projects
  add column if not exists include_everyone boolean not null default false;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'lead_person_id'
  ) then
    insert into project_members (project_id, person_id, role)
    select projects.id, projects.lead_person_id, 'Member'
    from projects
    where not exists (
      select 1
      from project_members
      where project_members.project_id = projects.id
        and project_members.person_id = projects.lead_person_id
    );

    alter table projects drop column lead_person_id;
  end if;
end $$;

create table if not exists task_responsibles (
  task_id uuid not null references tasks (id) on delete cascade,
  person_id uuid not null references people (id) on delete restrict,
  primary key (task_id, person_id)
);

create index if not exists task_responsibles_person_id_idx
  on task_responsibles (person_id);

alter table task_responsibles enable row level security;
alter table task_responsibles force row level security;
revoke all on table task_responsibles from public, anon, authenticated;
grant select on task_responsibles to anon;

drop policy if exists task_responsibles_public_read on task_responsibles;
create policy task_responsibles_public_read
  on task_responsibles
  for select
  to anon
  using (true);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'responsible_person_id'
  ) then
    insert into task_responsibles (task_id, person_id)
    select id, responsible_person_id
    from tasks
    where responsible_person_id is not null
    on conflict do nothing;

    alter table tasks drop column responsible_person_id;
  end if;
end $$;

notify pgrst, 'reload schema';
