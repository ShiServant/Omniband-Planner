-- Task statuses are In progress or Done. Important tasks are flagged on the dashboard.
-- Run this once in the Supabase SQL editor.

update tasks
set status = 'in_progress'
where status in ('to_do', 'blocked');

alter table tasks
  alter column status set default 'in_progress';

alter table tasks
  add column if not exists important boolean not null default false;

notify pgrst, 'reload schema';
