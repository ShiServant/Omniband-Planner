"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { assertProjects } from "@/lib/admin/records";
import { emptyToNull, field, fields, firstIssue } from "@/lib/forms";
import { fromDateTimeLocal, isUuid } from "@/lib/format";
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
      await syncFiles(db, meetingId, formData);

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

const MAX_FILE_BYTES = 4 * 1024 * 1024;

async function syncFiles(
  db: Parameters<Parameters<typeof withAdminDb>[0]>[0],
  meetingId: string,
  formData: FormData,
) {
  const removeIds = fields(formData, "removeFileId").filter(isUuid);

  if (removeIds.length > 0) {
    const removed = await db
      .from("meeting_files")
      .delete()
      .eq("meeting_id", meetingId)
      .in("id", removeIds);

    if (removed.error) {
      throwFileError(removed.error);
    }
  }

  const attachments = formData
    .getAll("attachment")
    .filter((item): item is File => item instanceof File && item.size > 0);

  for (const file of attachments) {
    if (file.size > MAX_FILE_BYTES) {
      throw new SaveError("Each file must be 4 MB or smaller.");
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const inserted = await db.from("meeting_files").insert({
      meeting_id: meetingId,
      file_name: file.name.trim().slice(0, 200) || "file",
      content_type: file.type || "application/octet-stream",
      content_base64: bytes.toString("base64"),
    });

    if (inserted.error) {
      throwFileError(inserted.error);
    }
  }
}

function throwFileError(error: { code?: string; message?: string }) {
  const text = error.message ?? "";
  const missing =
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    text.toLowerCase().includes("meeting_files");

  if (missing) {
    throw new SaveError(
      "File attachments are not available yet. Add the latest database migration in Supabase.",
    );
  }

  throwDb(error);
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
