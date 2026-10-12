import "server-only";

import { cache } from "react";
import { failRead, one, type DataResult } from "@/lib/data/read";
import { isUuid } from "@/lib/format";
import { getReadClient } from "@/lib/supabase/read";
import type {
  NamedRef,
  TaskFilters,
  TaskPriority,
  TaskStatus,
  TaskSummary,
} from "@/lib/types";

export const TASK_SELECT = `
  id,
  title,
  description,
  status,
  priority,
  due_date,
  project:projects!project_id (id, name),
  responsible:people!responsible_person_id (id, name),
  source_meeting:meetings!source_meeting_id (id, title)
`;

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  project: NamedRef | NamedRef[] | null;
  responsible: NamedRef | NamedRef[] | null;
  source_meeting:
    | { id: string; title: string }
    | Array<{ id: string; title: string }>
    | null;
};

export function mapTask(row: TaskRow): TaskSummary {
  const project = one(row.project);
  const responsible = one(row.responsible);

  if (!project || !responsible) {
    failRead("tasks", `Task ${row.id} is missing its project or responsible person.`);
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    project,
    responsible,
    sourceMeeting: one(row.source_meeting),
  };
}

export function compareTasks(a: TaskSummary, b: TaskSummary) {
  if ((a.status === "done") !== (b.status === "done")) {
    return a.status === "done" ? 1 : -1;
  }

  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
    return a.dueDate < b.dueDate ? -1 : 1;
  }

  if (a.dueDate && !b.dueDate) {
    return -1;
  }

  if (!a.dueDate && b.dueDate) {
    return 1;
  }

  return a.title.localeCompare(b.title, "en");
}

export async function listTasks(
  filters: TaskFilters = {},
): Promise<DataResult<TaskSummary[]>> {
  const client = getReadClient();

  if (!client) {
    return { configured: false };
  }

  const base = client.from("tasks").select(TASK_SELECT);
  const byPerson = filters.personId
    ? base.eq("responsible_person_id", filters.personId)
    : base;
  const byProject = filters.projectId
    ? byPerson.eq("project_id", filters.projectId)
    : byPerson;
  const byPriority = filters.priority
    ? byProject.eq("priority", filters.priority)
    : byProject;
  const byStatus =
    filters.status === "outstanding"
      ? byPriority.neq("status", "done")
      : filters.status && filters.status !== "all"
        ? byPriority.eq("status", filters.status)
        : byPriority;
  const { data, error } = await byStatus;

  if (error) {
    failRead("tasks", error.message);
  }

  return {
    configured: true,
    data: ((data ?? []) as TaskRow[]).map(mapTask).sort(compareTasks),
  };
}

export const getTask = cache(
  async (id: string): Promise<DataResult<TaskSummary | null>> => {
    if (!isUuid(id)) {
      return { configured: true, data: null };
    }

    const client = getReadClient();

    if (!client) {
      return { configured: false };
    }

    const { data, error } = await client
      .from("tasks")
      .select(TASK_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      failRead("task", error.message);
    }

    if (!data) {
      return { configured: true, data: null };
    }

    return { configured: true, data: mapTask(data as TaskRow) };
  },
);
