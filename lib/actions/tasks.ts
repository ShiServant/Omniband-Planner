"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { assertPeople, assertProjects } from "@/lib/admin/records";
import { emptyToNull, field, fields, firstIssue } from "@/lib/forms";
import { safeReturnTo } from "@/lib/admin/token";
import { isUuid } from "@/lib/format";
import { syncAttachments } from "@/lib/files";
import {
  EditAccessError,
  SaveError,
  messageFrom,
  throwDb,
  withAdminDb,
} from "@/lib/supabase/admin";
import { taskSchema } from "@/lib/validators";

export async function saveTask(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");

  if (id && !isUuid(id)) {
    return { error: "This record could not be found." };
  }

  const parsed = taskSchema.safeParse({
    title: field(formData, "title"),
    description: field(formData, "description"),
    projectId: field(formData, "projectId"),
    responsiblePersonIds: [
      ...new Set(fields(formData, "responsiblePersonId").filter(isUuid)),
    ],
    status: field(formData, "status"),
    priority: field(formData, "priority"),
    dueDate: field(formData, "dueDate"),
    important: field(formData, "important") === "true",
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const payload = {
    title: parsed.data.title,
    description: emptyToNull(parsed.data.description),
    project_id: parsed.data.projectId,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: emptyToNull(parsed.data.dueDate),
    important: parsed.data.important,
  };

  let savedId = id;

  try {
    savedId = await withAdminDb(async (db) => {
      const existing = id
        ? await db.from("tasks").select("id").eq("id", id).maybeSingle()
        : { data: null, error: null };
      const existingPeople = id
        ? await db
            .from("task_responsibles")
            .select("person_id")
            .eq("task_id", id)
        : { data: [], error: null };

      if (existing.error) {
        throwDb(existing.error);
      }

      if (existingPeople.error) {
        throwDb(existingPeople.error);
      }

      if (id && !existing.data) {
        throw new SaveError("This record could not be found.");
      }

      const allowedInactive = new Set(
        ((existingPeople.data ?? []) as Array<{ person_id: string }>).map(
          (row) => row.person_id,
        ),
      );

      await assertProjects(db, [parsed.data.projectId]);
      await assertPeople(db, parsed.data.responsiblePersonIds, allowedInactive);

      let taskId = id;

      if (id) {
        const error = await writeTask(db, payload, id);

        if (error) {
          throwTaskError(error, payload.important);
        }
      } else {
        const { data, error } = await insertTask(db, payload);

        if (error) {
          throwTaskError(error, payload.important);
        }

        taskId = String(data.id);
      }

      await replaceResponsibles(db, taskId, parsed.data.responsiblePersonIds);
      await syncAttachments(db, "task_files", "task_id", taskId, formData);
      return taskId;
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }

  revalidatePath("/", "layout");
  return { id: savedId };
}

async function replaceResponsibles(
  db: SupabaseClient,
  taskId: string,
  personIds: string[],
) {
  const removed = await db
    .from("task_responsibles")
    .delete()
    .eq("task_id", taskId);

  if (removed.error) {
    throwDb(removed.error);
  }

  if (personIds.length === 0) {
    return;
  }

  const inserted = await db.from("task_responsibles").insert(
    personIds.map((personId) => ({
      task_id: taskId,
      person_id: personId,
    })),
  );

  if (inserted.error) {
    throwDb(inserted.error);
  }
}

function missingImportantColumn(error: { code?: string; message?: string }) {
  const text = `${error.code ?? ""} ${error.message ?? ""}`;
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /important/i.test(text)
  );
}

function withoutImportant(payload: { important: boolean }) {
  const { important: _important, ...rest } = payload;
  return rest;
}

async function writeTask(
  db: Parameters<Parameters<typeof withAdminDb>[0]>[0],
  payload: {
    title: string;
    description: string | null;
    project_id: string;
    status: string;
    priority: string;
    due_date: string | null;
    important: boolean;
  },
  id: string,
) {
  const updated = await db.from("tasks").update(payload).eq("id", id);

  if (updated.error && missingImportantColumn(updated.error) && !payload.important) {
    const retried = await db
      .from("tasks")
      .update(withoutImportant(payload))
      .eq("id", id);
    return retried.error;
  }

  return updated.error;
}

async function insertTask(
  db: Parameters<Parameters<typeof withAdminDb>[0]>[0],
  payload: {
    title: string;
    description: string | null;
    project_id: string;
    status: string;
    priority: string;
    due_date: string | null;
    important: boolean;
  },
) {
  const inserted = await db.from("tasks").insert(payload).select("id").single();

  if (
    inserted.error &&
    missingImportantColumn(inserted.error) &&
    !payload.important
  ) {
    return db.from("tasks").insert(withoutImportant(payload)).select("id").single();
  }

  return inserted;
}

function throwTaskError(
  error: { code?: string; message?: string },
  important: boolean,
): never {
  if (important && missingImportantColumn(error)) {
    throw new SaveError(
      "Important tasks need a database update. Run the latest migration in Supabase.",
    );
  }

  throwDb(error);
}

export async function markTaskDone(formData: FormData) {
  const id = field(formData, "id");

  if (!isUuid(id)) {
    return;
  }

  try {
    await withAdminDb(async (db) => {
      const { data, error } = await db
        .from("tasks")
        .update({ status: "done" })
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) {
        throwDb(error);
      }

      if (!data) {
        throw new SaveError("This record could not be found.");
      }
    });
  } catch (error) {
    if (error instanceof EditAccessError) {
      redirect("/admin?returnTo=/tasks");
    }

    console.error(error);
    return;
  }

  revalidatePath("/", "layout");
}

export async function deleteTask(formData: FormData) {
  const id = field(formData, "id");
  const returnTo = field(formData, "returnTo");

  if (!isUuid(id)) {
    return;
  }

  try {
    await withAdminDb(async (db) => {
      const { error } = await db.from("tasks").delete().eq("id", id);

      if (error) {
        throwDb(error);
      }
    });
  } catch (error) {
    if (error instanceof EditAccessError) {
      redirect(
        `/admin?returnTo=${encodeURIComponent(safeReturnTo(returnTo || "/tasks"))}`,
      );
    }

    console.error(error);
    return;
  }

  revalidatePath("/", "layout");

  if (returnTo) {
    redirect(safeReturnTo(returnTo));
  }
}
