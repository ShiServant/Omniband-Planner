import { PersonAvatar } from "@/components/person-avatar";
import { PersonLink } from "@/components/record-link";
import { Section } from "@/components/section";
import {
  HealthBadge,
  ProjectStatusBadge,
} from "@/components/status-badge";
import { TaskList } from "@/components/task-list";
import { formatDate } from "@/lib/format";
import type { ProjectDetail } from "@/lib/types";
import Link from "next/link";

export function ProjectDetailView({ project }: { project: ProjectDetail }) {
  const openTasks = project.tasks.filter((task) => task.status !== "done");
  const doneTasks = project.tasks.filter((task) => task.status === "done");

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} />
        {project.health ? <HealthBadge health={project.health} /> : null}
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
        {project.progress !== null ? (
          <>
            <span aria-hidden> · </span>
            Progress {project.progress}%
          </>
        ) : null}
      </p>
      {project.description ? (
        <p className="mt-6 max-w-3xl text-sm leading-6">{project.description}</p>
      ) : null}
      {project.objective ? (
        <p className="mt-3 max-w-3xl text-sm leading-6">
          <span className="font-medium">Objective. </span>
          {project.objective}
        </p>
      ) : null}

      <dl className="mt-8 grid gap-6 sm:grid-cols-2">
        <Info label="Current update" value={project.currentUpdate} />
        <Info label="Next step" value={project.nextStep} />
        <Info label="Next milestone" value={project.nextMilestone} />
        <Info label="Blocker" value={project.blocker} />
      </dl>

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

      <Section title="Tasks" prominent>
        {openTasks.length > 0 ? (
          <TaskList tasks={openTasks} showProject={false} />
        ) : (
          <p className="text-sm text-muted-foreground">No outstanding tasks.</p>
        )}
        {doneTasks.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Done
            </h3>
            <TaskList tasks={doneTasks} showProject={false} />
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

      <Section title="Decisions" prominent>
        {project.decisions.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {project.decisions.map((decision) => (
              <li key={decision.id} className="px-4 py-4">
                <p className="font-medium">{decision.content}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <Link
                    href={`/meetings/${decision.meeting.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {decision.meeting.title}
                  </Link>
                  <span aria-hidden> · </span>
                  {formatDate(decision.meeting.meetingDate)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No decisions recorded.</p>
        )}
      </Section>
    </>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 max-w-xl text-sm leading-6">
        {value || "None recorded."}
      </dd>
    </div>
  );
}
