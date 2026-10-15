import "server-only";

import { cache } from "react";
import { failRead, one, type DataResult } from "@/lib/data/read";
import { loadTaskFiles } from "@/lib/files";
import { isUuid } from "@/lib/format";
import { getReadClient } from "@/lib/supabase/read";
import type {
  NamedRef,
  TaskFilters,
  TaskPriority,
  TaskSummary,
} from "@/lib/types";

const TASK_COLUMNS = `
  id,
  title,
  description,
  status,
  priority,
  due_date,
  project:projects!project_id (id, name),
  responsibles:task_responsibles (
    person:people!person_id (id, name)
  ),
  source_meeting:meetings!source_meeting_id (id, title)
`;

export const TASK_SELECT = `
  ${TASK_COLUMNS},
  important
`;

const TASK_SELECT_LEGACY = TASK_COLUMNS;

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: TaskPriority;
  important?: boolean;
  due_date: string | null;
  project: NamedRef | NamedRef[] | null;
  responsibles: Array<{
    person: NamedRef | NamedRef[] | null;
  }> | null;
  source_meeting:
    | { id: string; title: string }
    | Array<{ id: string; title: string }>
    | null;
};

export function mapTask(row: TaskRow): TaskSummary {
  const project = one(row.project);

  if (!project) {
    failRead("tasks", `Task ${row.id} is missing its project.`);
  }

  const responsibles = (row.responsibles ?? [])
    .flatMap((item) => {
      const person = one(item.person);
      return person ? [person] : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status === "done" ? "done" : "in_progress",
    priority: row.priority,
    important: row.important === true,
    dueDate: row.due_date,
    project,
    responsibles,
    sourceMeeting: one(row.source_meeting),
    files: [],
  };
}

export function compareTasks(a: TaskSummary, b: TaskSummary) {
  if (a.important !== b.important) {
    return a.important ? -1 : 1;
  }

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

export async function taskIdsForPerson(
  client: NonNullable<ReturnType<typeof getReadClient>>,
  personId: string,
) {
  const { data, error } = await client
    .from("task_responsibles")
    .select("task_id")
    .eq("person_id", personId);

  if (error) {
    failRead("tasks", error.message ?? "The database did not respond.");
  }

  return [
    ...new Set(
      ((data ?? []) as Array<{ task_id: string }>).map((row) => row.task_id),
    ),
  ];
}

export async function listTasks(
  filters: TaskFilters = {},
): Promise<DataResult<TaskSummary[]>> {
  const client = getReadClient();

  if (!client) {
    return { configured: false };
  }

  const responsibleIds = filters.personId
    ? await taskIdsForPerson(client, filters.personId)
    : null;

  if (responsibleIds && responsibleIds.length === 0) {
    return { configured: true, data: [] };
  }

  const rows = await readTaskRows("tasks", (columns) => {
    const base = client.from("tasks").select(columns);
    const byPerson = responsibleIds
      ? base.in("id", responsibleIds)
      : base;
    const byProject = filters.projectId
      ? byPerson.eq("project_id", filters.projectId)
      : byPerson;
    const byPriority = filters.priority
      ? byProject.eq("priority", filters.priority)
      : byProject;

    if (!filters.status || filters.status === "in_progress") {
      return byPriority.in("status", ["to_do", "in_progress", "blocked"]);
    }

    if (filters.status === "done") {
      return byPriority.eq("status", "done");
    }

    return byPriority;
  });

  return {
    configured: true,
    data: await loadTaskFiles(
      client,
      rows.map(mapTask).sort(compareTasks),
    ),
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

    const row = await readTaskRow("task", (columns) =>
      client.from("tasks").select(columns).eq("id", id).maybeSingle(),
    );

    if (!row) {
      return { configured: true, data: null };
    }

    return {
      configured: true,
      data: (await loadTaskFiles(client, [mapTask(row)]))[0],
    };
  },
);

type TaskQueryError = { code?: string; message?: string } | null;

function missingImportantColumn(error: TaskQueryError) {
  if (!error) {
    return false;
  }

  const text = `${error.code ?? ""} ${error.message ?? ""}`;
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /important/i.test(text)
  );
}

export async function readTaskRows(
  label: string,
  run: (
    columns: string,
  ) => PromiseLike<{ data: unknown; error: TaskQueryError }>,
) {
  const primary = await run(TASK_SELECT);

  if (primary.error && missingImportantColumn(primary.error)) {
    const fallback = await run(TASK_SELECT_LEGACY);

    if (fallback.error) {
      failRead(label, fallback.error.message ?? "The database did not respond.");
    }

    return (fallback.data ?? []) as TaskRow[];
  }

  if (primary.error) {
    failRead(label, primary.error.message ?? "The database did not respond.");
  }

  return (primary.data ?? []) as TaskRow[];
}

async function readTaskRow(
  label: string,
  run: (
    columns: string,
  ) => PromiseLike<{ data: unknown; error: TaskQueryError }>,
) {
  const primary = await run(TASK_SELECT);

  if (primary.error && missingImportantColumn(primary.error)) {
    const fallback = await run(TASK_SELECT_LEGACY);

    if (fallback.error) {
      failRead(label, fallback.error.message ?? "The database did not respond.");
    }

    return (fallback.data ?? null) as TaskRow | null;
  }

  if (primary.error) {
    failRead(label, primary.error.message ?? "The database did not respond.");
  }

  return (primary.data ?? null) as TaskRow | null;
}
