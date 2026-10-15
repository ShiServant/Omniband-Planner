"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { assertProjects } from "@/lib/admin/records";
import { emptyToNull, field, fields, firstIssue } from "@/lib/forms";
import { fromDateTimeLocal, isUuid } from "@/lib/format";
import { syncAttachments } from "@/lib/files";
import { SaveError, messageFrom, throwDb, withAdminDb } from "@/lib/supabase/admin";
import { meetingSchema } from "@/lib/validators";

export async function saveMeeting(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");

  if (id && !isUuid(id)) {
    return { error: "This record could not be found." };
  }

  const parsed = meetingSchema.safeParse({
    title: field(formData, "title"),
    meetingLocal: field(formData, "meetingLocal"),
    summary: field(formData, "summary"),
    projectIds: fields(formData, "projectId").filter(isUuid),
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const meetingDate = fromDateTimeLocal(parsed.data.meetingLocal);

  if (!meetingDate) {
    return { error: "Enter a valid London date and time." };
  }

  let savedId = id;

  try {
    savedId = await withAdminDb(async (db) => {
      if (id) {
        const existing = await db
          .from("meetings")
          .select("id")
          .eq("id", id)
          .maybeSingle();

        if (existing.error) {
          throwDb(existing.error);
        }

        if (!existing.data) {
          throw new SaveError("This record could not be found.");
        }
      }

      await assertProjects(db, parsed.data.projectIds);

      const meetingPayload = {
        title: parsed.data.title,
        meeting_date: meetingDate,
        summary: emptyToNull(parsed.data.summary),
      };
      let meetingId = id;

      if (id) {
        const { error } = await db
          .from("meetings")
          .update(meetingPayload)
          .eq("id", id);

        if (error) {
          throwDb(error);
        }
      } else {
        const { data, error } = await db
          .from("meetings")
          .insert(meetingPayload)
          .select("id")
          .single();

        if (error) {
          throwDb(error);
        }

        meetingId = String(data.id);
      }

      await replaceRows(
        db,
        "meeting_projects",
        meetingId,
        parsed.data.projectIds.map((projectId) => ({
          meeting_id: meetingId,
          project_id: projectId,
        })),
      );
      await syncAttachments(
        db,
        "meeting_files",
        "meeting_id",
        meetingId,
        formData,
      );

      return meetingId;
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }

  revalidatePath("/", "layout");
  return { id: savedId };
}

export async function deleteMeeting(formData: FormData) {
  const id = field(formData, "id");

  if (!isUuid(id)) {
    return;
  }

  try {
    await withAdminDb(async (db) => {
      const { error } = await db.from("meetings").delete().eq("id", id);

      if (error) {
        throwDb(error);
      }
    });
  } catch (error) {
    console.error(error);
    return;
  }

  revalidatePath("/", "layout");
  redirect("/meetings");
}

async function replaceRows(
  db: Parameters<Parameters<typeof withAdminDb>[0]>[0],
  table: "meeting_attendees" | "meeting_projects",
  meetingId: string,
  rows: Array<Record<string, string>>,
) {
  const removed = await db.from(table).delete().eq("meeting_id", meetingId);

  if (removed.error) {
    throwDb(removed.error);
  }

  if (rows.length === 0) {
    return;
  }

  const inserted = await db.from(table).insert(rows);

  if (inserted.error) {
    throwDb(inserted.error);
  }
}
