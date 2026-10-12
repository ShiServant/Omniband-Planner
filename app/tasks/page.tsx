import type { Metadata } from "next";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { EditLink } from "@/components/edit-link";
import { PageHeader } from "@/components/page-header";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { hasEditAccess } from "@/lib/admin/session";
import { listPeople } from "@/lib/data/people";
import { listProjects } from "@/lib/data/projects";
import { listTasks } from "@/lib/data/tasks";
import { firstParam } from "@/lib/format";
import { parseTaskFilters } from "@/lib/task-filters";

export const metadata: Metadata = {
  title: "Tasks",
};

export default async function TasksPage(props: PageProps<"/tasks">) {
  const params = await props.searchParams;
  const filters = parseTaskFilters({
    person: firstParam(params.person),
    project: firstParam(params.project),
    status: firstParam(params.status),
    priority: firstParam(params.priority),
  });
  const [tasks, people, projects, editing] = await Promise.all([
    listTasks(filters),
    listPeople(),
    listProjects("all"),
    hasEditAccess(),
  ]);

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Actions that need to happen, and the person responsible for each one."
        action={editing ? <EditLink href="/tasks/new">Add task</EditLink> : null}
      />
      {tasks.configured && people.configured && projects.configured ? (
        <>
          <TaskFilters
            filters={filters}
            people={people.data}
            projects={projects.data}
          />
          <p className="mb-3 text-sm text-muted-foreground">
            {taskCountLabel(tasks.data.length, filters.status)}
          </p>
          {tasks.data.length > 0 ? (
            <TaskList tasks={tasks.data} canEdit={editing} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No tasks match these filters.
            </p>
          )}
        </>
      ) : (
        <DatabaseUnavailable />
      )}
    </>
  );
}

function taskCountLabel(
  count: number,
  status: string | undefined,
) {
  const noun = count === 1 ? "task" : "tasks";

  if (!status || status === "outstanding") {
    return `${count} outstanding ${noun}`;
  }

  return `${count} ${noun}`;
}
