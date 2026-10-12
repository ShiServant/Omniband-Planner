-- Sample society data for local review and a first deploy.
-- Safe to skip on a database that already has real records.
-- Runs once against an empty schema. A second run stops on the existing ids.

insert into people (
  id,
  name,
  society_role,
  email,
  contact_info,
  active
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'Kevin',
    'Project Lead',
    'kevin@society.example',
    'Discord: kevin',
    true
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'Alex',
    'Events Coordinator',
    'alex@society.example',
    null,
    true
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'Amy',
    'Secretary',
    'amy@society.example',
    null,
    true
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    'James',
    'Electronics Member',
    'james@society.example',
    null,
    true
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    'Sam',
    'Member',
    'sam@society.example',
    null,
    false
  );

insert into projects (
  id,
  name,
  description,
  objective,
  status,
  health,
  progress,
  lead_person_id,
  start_date,
  due_date,
  current_update,
  next_step,
  next_milestone,
  blocker,
  updated_at
)
values
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'Drone Project',
    'A student-built quadcopter, from the flight controller through to a first stable hover.',
    'Fly a stable hover on the society''s own controller board.',
    'in_progress',
    'at_risk',
    null,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '2026-09-01',
    '2026-10-18',
    'Revision A of the flight controller has been bench-tested. The next board spin is waiting on sensor samples.',
    'PCB Revision B',
    'Hover test on revision B',
    'Waiting for sensor samples',
    '2026-10-12 09:00:00+01'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'Workshop 2026',
    'An introductory electronics workshop for new members.',
    'Run the workshop with a confirmed room, materials, and tutors.',
    'planning',
    'on_track',
    20,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '2026-09-15',
    '2026-10-25',
    'Three rooms are shortlisted with the university estates office.',
    'Confirm venue',
    'Venue confirmed',
    null,
    '2026-10-09 15:00:00+01'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    'Freshers Stall',
    'The society stall at the October freshers fair.',
    'Sign up new members and publish the term''s project list.',
    'in_progress',
    'blocked',
    null,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '2026-09-20',
    '2026-10-16',
    'The poster and volunteer rota are ready.',
    'Confirm the room booking',
    'Stall open on the day',
    'Waiting for room booking confirmation',
    '2026-10-11 12:00:00+01'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
    'Website Refresh',
    'Replace the old society homepage with the current project list.',
    'Publish a page that shows active projects and who leads them.',
    'completed',
    null,
    null,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    '2026-06-01',
    '2026-09-01',
    'The new homepage went live in September.',
    null,
    null,
    null,
    '2026-09-02 11:00:00+01'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
    '2025 Ball',
    'The society''s annual ball.',
    'Host the 2025 ball.',
    'archived',
    null,
    null,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '2025-06-01',
    '2025-11-15',
    'Closed after the event.',
    null,
    null,
    null,
    '2025-11-16 20:00:00+00'
  );

insert into project_members (project_id, person_id, role)
values
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'Electronics'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    'Airframe'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'Workshops'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    'Member'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'Member'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'Member'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'Member'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    'Member'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'Member'
  );

insert into meetings (
  id,
  title,
  meeting_date,
  summary,
  discussion_notes,
  updated_at
)
values
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'Engineering Meeting',
    '2026-10-12 18:00:00+01',
    'The controller chip was chosen, and the workshop venue is the next deadline.',
    'Kevin reported that revision A powers on and talks to the host. The group chose the STM32H7 for revision B. Sensor samples are still late, which blocks the board order. Alex has three rooms shortlisted for the electronics workshop and will confirm one by 20 October. Amy noted the freshers stall is still waiting on a room booking.',
    '2026-10-12 20:00:00+01'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    '2025 Ball debrief',
    '2025-11-16 19:00:00+00',
    'The ball is closed. Thank-you notes were the remaining action.',
    'Alex confirmed the venue invoice was paid. Sam took the thank-you notes. The group agreed to keep the venue in mind if the society runs another ball.',
    '2025-11-16 21:00:00+00'
  );

insert into meeting_attendees (meeting_id, person_id)
values
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'
  );

insert into meeting_projects (meeting_id, project_id)
values
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5'
  );

insert into decisions (id, meeting_id, project_id, content, created_at)
values
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'Use STM32H7 for the new controller.',
    '2026-10-12 18:30:00+01'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'Confirm the workshop venue by 20 October, and use the engineering lab if estates has not replied.',
    '2026-10-12 18:40:00+01'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee3',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
    'Keep this venue in mind if the society runs another ball.',
    '2025-11-16 19:20:00+00'
  );

insert into tasks (
  id,
  project_id,
  title,
  description,
  responsible_person_id,
  status,
  priority,
  due_date,
  source_meeting_id,
  updated_at
)
values
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'Finish PCB Revision B',
    'Lay out revision B around the STM32H7 chosen in the engineering meeting.',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'in_progress',
    'high',
    '2026-10-18',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '2026-10-12 20:10:00+01'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd2',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'Order sensor samples',
    'Chase the supplier for the IMU samples needed before the board can be ordered.',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    'blocked',
    'urgent',
    '2026-10-09',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '2026-10-12 20:10:00+01'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd3',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'Confirm venue',
    'Choose one of the three shortlisted rooms, or book the engineering lab.',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'to_do',
    'high',
    '2026-10-20',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '2026-10-12 20:10:00+01'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd4',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'Prepare electronics workshop',
    'Pack the kits and confirm who is tutoring each bench.',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'to_do',
    'medium',
    '2026-10-28',
    null,
    '2026-10-08 10:00:00+01'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd5',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    'Chase room booking',
    'Ask estates again for the freshers fair table confirmation.',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'in_progress',
    'urgent',
    '2026-10-13',
    null,
    '2026-10-11 12:30:00+01'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd6',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
    'Send thank-you notes to the venue',
    null,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    'done',
    'low',
    '2025-11-20',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    '2025-11-18 09:00:00+00'
  );
