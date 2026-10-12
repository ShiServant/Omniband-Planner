import { PersonAvatar } from "@/components/person-avatar";
import { ProjectLink } from "@/components/record-link";
import { Section } from "@/components/section";
import {
  HealthBadge,
  ProjectStatusBadge,
  StatusBadge,
} from "@/components/status-badge";
import { TaskList } from "@/components/task-list";
import type { PersonDetail } from "@/lib/types";

export function PersonDetailView({ person }: { person: PersonDetail }) {
  const openTasks = person.tasks.filter((task) => task.status !== "done");
  const doneTasks = person.tasks.filter((task) => task.status === "done");

  return (
    <>
      <div className="flex items-start gap-4">
        <PersonAvatar name={person.name} url={person.avatarUrl} size="md" />
        <div>
          {person.societyRole ? (
            <p className="text-sm text-muted-foreground">{person.societyRole}</p>
          ) : null}
          {person.active ? null : (
            <div className="mt-2">
              <StatusBadge tone="muted">Inactive</StatusBadge>
            </div>
          )}
        </div>
      </div>

      <dl className="mt-6 space-y-2 text-sm">
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Email</dt>
          <dd className="mt-1">
            {person.email ? (
              <a
                href={`mailto:${person.email}`}
                className="underline-offset-4 hover:underline"
              >
                {person.email}
              </a>
            ) : (
              "None recorded."
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Contact</dt>
          <dd className="mt-1">{person.contactInfo || "None recorded."}</dd>
        </div>
      </dl>

      <Section title="Projects" prominent>
        {person.projects.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {person.projects.map((project) => (
              <li
                key={`${project.id}-${project.role}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  <ProjectLink project={project} className="font-medium" />
                  <span className="text-muted-foreground"> · {project.role}</span>
                </span>
                <span className="flex gap-2">
                  <ProjectStatusBadge status={project.status} />
                  {project.health ? <HealthBadge health={project.health} /> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No projects list this person.
          </p>
        )}
      </Section>

      <Section title="Responsible tasks" prominent>
        {openTasks.length > 0 ? (
          <TaskList tasks={openTasks} showResponsible={false} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No outstanding tasks.
          </p>
        )}
        {doneTasks.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Done
            </h3>
            <TaskList tasks={doneTasks} showResponsible={false} />
          </div>
        ) : null}
      </Section>
    </>
  );
}
