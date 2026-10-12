-- Society Project Hub schema.
-- The publishable key connects as the database role "anon", which can only read.
-- Privileged writes use the server-side secret key, which bypasses these policies.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;

  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end
$$;

grant usage on schema public to anon;

create type project_status as enum (
  'planning',
  'in_progress',
  'completed',
  'archived'
);

create type project_health as enum (
  'on_track',
  'at_risk',
  'blocked'
);

create type task_status as enum (
  'to_do',
  'in_progress',
  'blocked',
  'done'
);

create type task_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

create function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function set_updated_at() from public, anon, authenticated;

create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  society_role text,
  email text,
  contact_info text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint people_name_not_blank check (length(btrim(name)) > 0)
);

create unique index people_email_unique on people (email) where email is not null;

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  objective text,
  status project_status not null default 'planning',
  health project_health,
  progress integer,
  lead_person_id uuid not null references people (id) on delete restrict,
  start_date date,
  due_date date,
  current_update text,
  next_step text,
  next_milestone text,
  blocker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_name_not_blank check (length(btrim(name)) > 0),
  constraint projects_progress_range check (
    progress is null or (progress >= 0 and progress <= 100)
  ),
  constraint projects_date_order check (
    start_date is null or due_date is null or due_date >= start_date
  ),
  -- Health is required while a project is active, and cleared once it is finished.
  constraint projects_health_matches_status check (
    (
      status in ('completed', 'archived')
      and health is null
    )
    or (
      status in ('planning', 'in_progress')
      and health is not null
    )
  )
);

create index projects_lead_person_id_idx on projects (lead_person_id);
create index projects_status_idx on projects (status);
create index projects_due_date_idx on projects (due_date);
create index projects_updated_at_idx on projects (updated_at desc);

create trigger projects_set_updated_at
before update on projects
for each row
execute function set_updated_at();

create table project_members (
  project_id uuid not null references projects (id) on delete cascade,
  person_id uuid not null references people (id) on delete restrict,
  role text not null default 'Member',
  primary key (project_id, person_id),
  constraint project_members_role_not_blank check (length(btrim(role)) > 0)
);

create index project_members_person_id_idx on project_members (person_id);

create table meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date timestamptz not null,
  summary text,
  discussion_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meetings_title_not_blank check (length(btrim(title)) > 0)
);

create index meetings_meeting_date_idx on meetings (meeting_date desc);

create trigger meetings_set_updated_at
before update on meetings
for each row
execute function set_updated_at();

create table meeting_attendees (
  meeting_id uuid not null references meetings (id) on delete cascade,
  person_id uuid not null references people (id) on delete restrict,
  primary key (meeting_id, person_id)
);

create index meeting_attendees_person_id_idx on meeting_attendees (person_id);

create table meeting_projects (
  meeting_id uuid not null references meetings (id) on delete cascade,
  project_id uuid not null references projects (id) on delete cascade,
  primary key (meeting_id, project_id)
);

create index meeting_projects_project_id_idx on meeting_projects (project_id);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  title text not null,
  description text,
  responsible_person_id uuid not null references people (id) on delete restrict,
  status task_status not null default 'to_do',
  priority task_priority not null default 'medium',
  due_date date,
  source_meeting_id uuid references meetings (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_not_blank check (length(btrim(title)) > 0)
);

create index tasks_project_id_idx on tasks (project_id);
create index tasks_responsible_person_id_idx on tasks (responsible_person_id);
create index tasks_source_meeting_id_idx on tasks (source_meeting_id);
create index tasks_status_due_date_idx on tasks (status, due_date);
create index tasks_priority_idx on tasks (priority);

create trigger tasks_set_updated_at
before update on tasks
for each row
execute function set_updated_at();

create table decisions (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings (id) on delete cascade,
  project_id uuid references projects (id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint decisions_content_not_blank check (length(btrim(content)) > 0)
);

create index decisions_meeting_id_idx on decisions (meeting_id);
create index decisions_project_id_idx on decisions (project_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'people',
    'projects',
    'project_members',
    'meetings',
    'meeting_attendees',
    'meeting_projects',
    'tasks',
    'decisions'
  ]
  loop
    execute format('alter table %I enable row level security', table_name);
    execute format('alter table %I force row level security', table_name);
    execute format(
      'revoke all on table %I from public, anon, authenticated',
      table_name
    );
    execute format('grant select on table %I to anon', table_name);
    execute format(
      'create policy %I on %I for select to anon using (true)',
      table_name || '_public_read',
      table_name
    );
  end loop;
end
$$;

notify pgrst, 'reload schema';
