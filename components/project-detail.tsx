import { EditLink } from "@/components/edit-link";
import { PersonAvatar } from "@/components/person-avatar";
import { PersonLink } from "@/components/record-link";
import { Section } from "@/components/section";
import { ProjectStatusBadge } from "@/components/status-badge";
import { TaskList } from "@/components/task-list";
import { formatDate } from "@/lib/format";
import type { ProjectDetail } from "@/lib/types";
import Link from "next/link";

export function ProjectDetailView({
  project,
  canEdit = false,
}: {
  project: ProjectDetail;
  canEdit?: boolean;
}) {
  const openTasks = project.tasks.filter((task) => task.status !== "done");
  const doneTasks = project.tasks.filter((task) => task.status === "done");

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Lead <PersonLink person={project.lead} />
        <span aria-hidden> · </span>
        Target {formatDate(project.dueDate) ?? "not set"}
        {project.startDate ? (
          <>
            <span aria-hidden> · </span>
            Started {formatDate(project.startDate)}
          </>
        ) : null}
      </p>
      {project.description ? (
        <p className="mt-6 max-w-3xl text-sm leading-6">{project.description}</p>
      ) : null}

      <Section title="Team">
        <ul className="divide-y rounded-lg border">
          {project.members.map((member) => (
            <li
              key={`${member.id}-${member.role}`}
              className="flex items-center gap-3 px-4 py-3 text-sm"
            >
              <PersonAvatar name={member.name} url={null} />
              <span>
                <PersonLink person={member} />
                <span className="text-muted-foreground"> · {member.role}</span>
                {member.active ? null : (
                  <span className="text-muted-foreground"> · Inactive</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Tasks"
        prominent
        action={
          canEdit ? (
            <EditLink href={`/tasks/new?project=${project.id}`}>Add task</EditLink>
          ) : null
        }
      >
        {openTasks.length > 0 ? (
          <TaskList tasks={openTasks} showProject={false} canEdit={canEdit} />
        ) : (
          <p className="text-sm text-muted-foreground">No outstanding tasks.</p>
        )}
        {doneTasks.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Done
            </h3>
            <TaskList tasks={doneTasks} showProject={false} canEdit={canEdit} />
          </div>
        ) : null}
      </Section>

      <Section title="Meetings">
        {project.meetings.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {project.meetings.map((meeting) => (
              <li key={meeting.id} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {meeting.title}
                  </Link>
                  <time className="text-sm text-muted-foreground">
                    {formatDate(meeting.meetingDate)}
                  </time>
                </div>
                {meeting.summary ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {meeting.summary}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No meetings have discussed this project.
          </p>
        )}
      </Section>
    </>
  );
}
