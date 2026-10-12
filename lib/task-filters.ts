import { isUuid } from "@/lib/format";
import type { TaskFilters, TaskPriority, TaskStatus } from "@/lib/types";

const statuses = new Set<TaskStatus | "all" | "outstanding">([
  "outstanding",
  "all",
  "to_do",
  "in_progress",
  "blocked",
  "done",
]);

const priorities = new Set<TaskPriority>(["low", "medium", "high", "urgent"]);

export function parseTaskFilters(params: {
  person?: string;
  project?: string;
  status?: string;
  priority?: string;
}): TaskFilters {
  const status = statuses.has(params.status as TaskStatus | "all" | "outstanding")
    ? (params.status as TaskFilters["status"])
    : "outstanding";

  return {
    personId:
      params.person && isUuid(params.person) ? params.person : undefined,
    projectId:
      params.project && isUuid(params.project) ? params.project : undefined,
    status,
    priority: priorities.has(params.priority as TaskPriority)
      ? (params.priority as TaskPriority)
      : undefined,
  };
}
