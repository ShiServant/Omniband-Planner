import { Button } from "@/components/ui/button";
import { priorityLabel, taskStatusLabel } from "@/lib/labels";
import type {
  PersonSummary,
  ProjectSummary,
  TaskFilters,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";

const statuses: Array<{ value: "" | TaskStatus | "all"; label: string }> = [
  { value: "", label: "Outstanding" },
  { value: "to_do", label: taskStatusLabel("to_do") },
  { value: "in_progress", label: taskStatusLabel("in_progress") },
  { value: "blocked", label: taskStatusLabel("blocked") },
  { value: "done", label: taskStatusLabel("done") },
  { value: "all", label: "All" },
];

const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

const fieldClass =
  "h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export function TaskFilters({
  filters,
  people,
  projects,
}: {
  filters: TaskFilters;
  people: PersonSummary[];
  projects: ProjectSummary[];
}) {
  const statusValue =
    !filters.status || filters.status === "outstanding" ? "" : filters.status;
  const filtered = Boolean(
    filters.personId ||
      filters.projectId ||
      filters.priority ||
      (filters.status && filters.status !== "outstanding"),
  );

  return (
    <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Responsible
        <select
          id="task-person"
          name="person"
          defaultValue={filters.personId ?? ""}
          className={fieldClass}
        >
          <option value="">All</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
              {person.active ? "" : " (inactive)"}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Project
        <select
          id="task-project"
          name="project"
          defaultValue={filters.projectId ?? ""}
          className={fieldClass}
        >
          <option value="">All</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Status
        <select
          id="task-status"
          name="status"
          defaultValue={statusValue}
          className={fieldClass}
        >
          {statuses.map((status) => (
            <option key={status.label} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Priority
        <select
          id="task-priority"
          name="priority"
          defaultValue={filters.priority ?? ""}
          className={fieldClass}
        >
          <option value="">All</option>
          {priorities.map((priority) => (
            <option key={priority} value={priority}>
              {priorityLabel(priority)}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="outline">
        Apply
      </Button>
      {filtered ? (
        <a
          href="/tasks"
          className="pb-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Clear
        </a>
      ) : null}
    </form>
  );
}
