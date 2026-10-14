import type { Metadata } from "next";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { requireEditPage } from "@/lib/admin/guard";
import { listPeople } from "@/lib/data/people";
import { listProjects } from "@/lib/data/projects";
import { firstParam, isUuid } from "@/lib/format";

export const metadata: Metadata = {
  title: "New task",
};

export default async function NewTaskPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireEditPage("/tasks/new");
  const params = await props.searchParams;
  const requestedProject = firstParam(params.project) ?? "";
  const [people, projects] = await Promise.all([
    listPeople(),
    listProjects("all"),
  ]);

  if (!people.configured || !projects.configured) {
    return (
      <>
        <PageHeader
          title="New task"
          back={{ href: "/tasks", label: "Tasks" }}
        />
        <DatabaseUnavailable />
      </>
    );
  }

  const ready =
    people.data.some((person) => person.active) && projects.data.length > 0;

  return (
    <>
      <PageHeader
        title="New task"
        description="Record the work and the person responsible for it."
        back={{ href: "/tasks", label: "Tasks" }}
      />
      {ready ? (
        <TaskForm
          people={people.data}
          projects={projects.data}
          defaultProjectId={isUuid(requestedProject) ? requestedProject : ""}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Add an active person and a project before creating a task.
        </p>
      )}
    </>
  );
}
