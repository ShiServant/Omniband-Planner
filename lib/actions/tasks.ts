"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { assertPeople, assertProjects } from "@/lib/admin/records";
import { emptyToNull, field, firstIssue } from "@/lib/forms";
import { isUuid } from "@/lib/format";
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
    responsiblePersonId: field(formData, "responsiblePersonId"),
    status: field(formData, "status"),
    priority: field(formData, "priority"),
    dueDate: field(formData, "dueDate"),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const payload = {
    title: parsed.data.title,
    description: emptyToNull(parsed.data.description),
    project_id: parsed.data.projectId,
    responsible_person_id: parsed.data.responsiblePersonId,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: emptyToNull(parsed.data.dueDate),
  };

  try {
    await withAdminDb(async (db) => {
      const existing = id
        ? await db
            .from("tasks")
            .select("responsible_person_id")
            .eq("id", id)
            .maybeSingle()
        : { data: null, error: null };

      if (existing.error) {
        throwDb(existing.error);
      }

      if (id && !existing.data) {
        throw new SaveError("This record could not be found.");
      }

      const currentResponsible = existing.data
        ? String(
            (existing.data as { responsible_person_id: string })
              .responsible_person_id,
          )
        : "";
      const allowedInactive = new Set<string>();

      if (currentResponsible === parsed.data.responsiblePersonId) {
        allowedInactive.add(currentResponsible);
      }

      await assertProjects(db, [parsed.data.projectId]);
      await assertPeople(db, [parsed.data.responsiblePersonId], allowedInactive);

      if (id) {
        const { error } = await db.from("tasks").update(payload).eq("id", id);

        if (error) {
          throwDb(error);
        }

        return;
      }

      const { error } = await db.from("tasks").insert(payload);

      if (error) {
        throwDb(error);
      }
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }

  revalidatePath("/", "layout");
  redirect(`/projects/${parsed.data.projectId}`);
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
