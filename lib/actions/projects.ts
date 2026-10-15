"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { assertPeople } from "@/lib/admin/records";
import { emptyToNull, field, fields, firstIssue } from "@/lib/forms";
import { isUuid } from "@/lib/format";
import { syncAttachments } from "@/lib/files";
import { SaveError, messageFrom, throwDb, withAdminDb } from "@/lib/supabase/admin";
import { projectSchema } from "@/lib/validators";

export async function saveProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");

  if (id && !isUuid(id)) {
    return { error: "This record could not be found." };
  }

  const status = field(formData, "status");
  const active = status === "planning" || status === "in_progress";
  const leadPersonId = field(formData, "leadPersonId");
  const memberIds = [
    ...new Set(
      fields(formData, "memberId").filter(
        (memberId) => memberId !== leadPersonId && isUuid(memberId),
      ),
    ),
  ];
  const parsed = projectSchema.safeParse({
    name: field(formData, "name"),
    description: field(formData, "description"),
    objective: "",
    status,
    health: active ? "on_track" : null,
    progress: null,
    startDate: field(formData, "startDate"),
    dueDate: field(formData, "dueDate"),
    currentUpdate: "",
    nextStep: "",
    nextMilestone: "",
    blocker: "",
    leadPersonId,
    memberIds,
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const payload = {
    name: parsed.data.name,
    description: emptyToNull(parsed.data.description),
    objective: emptyToNull(parsed.data.objective),
    status: parsed.data.status,
    health: parsed.data.health,
    progress: parsed.data.progress,
    start_date: emptyToNull(parsed.data.startDate),
    due_date: emptyToNull(parsed.data.dueDate),
    current_update: emptyToNull(parsed.data.currentUpdate),
    next_step: emptyToNull(parsed.data.nextStep),
    next_milestone: emptyToNull(parsed.data.nextMilestone),
    blocker: emptyToNull(parsed.data.blocker),
    lead_person_id: parsed.data.leadPersonId,
  };

  let savedId = id;

  try {
    savedId = await withAdminDb(async (db) => {
      const existingMembers = id
        ? await db
            .from("project_members")
            .select("person_id")
            .eq("project_id", id)
        : { data: [], error: null };
      const existingProject = id
        ? await db
            .from("projects")
            .select("lead_person_id")
            .eq("id", id)
            .maybeSingle()
        : { data: null, error: null };

      if (existingMembers.error) {
        throwDb(existingMembers.error);
      }

      if (existingProject.error) {
        throwDb(existingProject.error);
      }

      if (id && !existingProject.data) {
        throw new SaveError("This record could not be found.");
      }

      const allowedInactive = new Set<string>(
        [
          existingProject.data
            ? String(
                (existingProject.data as { lead_person_id: string })
                  .lead_person_id,
              )
            : "",
          ...((existingMembers.data ?? []) as Array<{ person_id: string }>).map(
            (member) => member.person_id,
          ),
        ].filter(Boolean),
      );

      await assertPeople(
        db,
        [parsed.data.leadPersonId, ...parsed.data.memberIds],
        allowedInactive,
      );

      if (id) {
        const { error } = await db.from("projects").update(payload).eq("id", id);

        if (error) {
          throwDb(error);
        }
      }

      let projectId = id;

      if (!id) {
        const { data, error } = await db
          .from("projects")
          .insert(payload)
          .select("id")
          .single();

        if (error) {
          throwDb(error);
        }

        projectId = String(data.id);
      }

      const removed = await db
        .from("project_members")
        .delete()
        .eq("project_id", projectId);

      if (removed.error) {
        throwDb(removed.error);
      }

      if (parsed.data.memberIds.length > 0) {
        const inserted = await db.from("project_members").insert(
          parsed.data.memberIds.map((personId) => ({
            project_id: projectId,
            person_id: personId,
            role: field(formData, `memberRole-${personId}`).trim() || "Member",
          })),
        );

        if (inserted.error) {
          throwDb(inserted.error);
        }
      }

      await syncAttachments(
        db,
        "project_files",
        "project_id",
        projectId,
        formData,
      );

      return projectId;
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }

  revalidatePath("/", "layout");
  return { id: savedId };
}

export async function deleteProject(formData: FormData) {
  const id = field(formData, "id");

  if (!isUuid(id)) {
    return;
  }

  try {
    await withAdminDb(async (db) => {
      const { error } = await db.from("projects").delete().eq("id", id);

      if (error) {
        throwDb(error);
      }
    });
  } catch (error) {
    console.error(error);
    return;
  }

  revalidatePath("/", "layout");
  redirect("/projects");
}
