"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { assertPeople, assertProjects } from "@/lib/admin/records";
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

  const decisionIds = fields(formData, "decisionId");
  const decisionContents = fields(formData, "decisionContent");
  const decisionProjects = fields(formData, "decisionProjectId");
  const decisions = decisionContents
    .map((content, index) => ({
      id: decisionIds[index] ?? "",
      content,
      projectId: decisionProjects[index] ?? "",
    }))
    .filter((decision) => decision.id !== "" || decision.content.trim() !== "");
  const actionIds = fields(formData, "actionId");
  const actionTitles = fields(formData, "actionTitle");
  const actions = actionTitles
    .map((title, index) => ({
      id: actionIds[index] ?? "",
      title,
      description: fields(formData, "actionDescription")[index] ?? "",
      responsiblePersonId: fields(formData, "actionResponsibleId")[index] ?? "",
      projectId: fields(formData, "actionProjectId")[index] ?? "",
      dueDate: fields(formData, "actionDue")[index] ?? "",
      status: fields(formData, "actionStatus")[index] ?? "",
      priority: fields(formData, "actionPriority")[index] ?? "",
    }))
    .filter((action) => action.id !== "" || action.title.trim() !== "");
  const parsed = meetingSchema.safeParse({
    title: field(formData, "title"),
    meetingLocal: field(formData, "meetingLocal"),
    summary: field(formData, "summary"),
    discussionNotes: field(formData, "discussionNotes"),
    attendeeIds: fields(formData, "attendeeId").filter(isUuid),
    projectIds: fields(formData, "projectId").filter(isUuid),
    decisions,
    actions,
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
      const existingAttendees = id
        ? await db
            .from("meeting_attendees")
            .select("person_id")
            .eq("meeting_id", id)
        : { data: [], error: null };

      if (existingAttendees.error) {
        throwDb(existingAttendees.error);
      }

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

      const actionRecordIds = parsed.data.actions
        .map((action) => action.id)
        .filter(Boolean);
      const existingTasks = actionRecordIds.length
        ? await db
            .from("tasks")
            .select("id, responsible_person_id")
            .in("id", actionRecordIds)
        : { data: [], error: null };

      if (existingTasks.error) {
        throwDb(existingTasks.error);
      }

      const tasksById = new Map(
        (
          (existingTasks.data ?? []) as Array<{
            id: string;
            responsible_person_id: string;
          }>
        ).map((task) => [task.id, task]),
      );

      for (const action of parsed.data.actions) {
        if (action.id && !tasksById.has(action.id)) {
          throw new SaveError("An action item could not be found.");
        }
      }

      const allowedInactive = new Set<string>(
        ((existingAttendees.data ?? []) as Array<{ person_id: string }>).map(
          (attendee) => attendee.person_id,
        ),
      );

      for (const action of parsed.data.actions) {
        const current = action.id ? tasksById.get(action.id) : undefined;

        if (current?.responsible_person_id === action.responsiblePersonId) {
          allowedInactive.add(action.responsiblePersonId);
        }
      }

      await assertPeople(
        db,
        [
          ...parsed.data.attendeeIds,
          ...parsed.data.actions.map((action) => action.responsiblePersonId),
        ],
        allowedInactive,
      );
      await assertProjects(db, [
        ...parsed.data.projectIds,
        ...parsed.data.decisions
          .map((decision) => decision.projectId)
          .filter(Boolean),
        ...parsed.data.actions.map((action) => action.projectId),
      ]);

      const meetingPayload = {
        title: parsed.data.title,
        meeting_date: meetingDate,
        summary: emptyToNull(parsed.data.summary),
        discussion_notes: emptyToNull(parsed.data.discussionNotes),
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

      await replaceRows(db, "meeting_attendees", meetingId, parsed.data.attendeeIds.map((personId) => ({
        meeting_id: meetingId,
        person_id: personId,
      })));
      await replaceRows(db, "meeting_projects", meetingId, parsed.data.projectIds.map((projectId) => ({
        meeting_id: meetingId,
        project_id: projectId,
      })));
      await syncDecisions(db, meetingId, parsed.data.decisions);
      await syncActions(db, meetingId, parsed.data.actions);

      return meetingId;
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }

  revalidatePath("/", "layout");
  redirect(`/meetings/${savedId}`);
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

async function syncDecisions(
  db: Parameters<Parameters<typeof withAdminDb>[0]>[0],
  meetingId: string,
  decisions: Array<{ id: string; content: string; projectId: string }>,
) {
  const existing = await db
    .from("decisions")
    .select("id")
    .eq("meeting_id", meetingId);

  if (existing.error) {
    throwDb(existing.error);
  }

  const existingIds = new Set(
    ((existing.data ?? []) as Array<{ id: string }>).map((decision) => decision.id),
  );

  for (const decision of decisions) {
    if (decision.id && !existingIds.has(decision.id)) {
      throw new SaveError("A decision on this form is no longer part of the meeting.");
    }
  }

  const keep = new Set(decisions.map((decision) => decision.id).filter(Boolean));
  const remove = [...existingIds].filter((decisionId) => !keep.has(decisionId));

  if (remove.length > 0) {
    const deleted = await db.from("decisions").delete().in("id", remove);

    if (deleted.error) {
      throwDb(deleted.error);
    }
  }

  for (const decision of decisions) {
    const payload = {
      content: decision.content.trim(),
      project_id: emptyToNull(decision.projectId),
    };

    if (decision.id) {
      const updated = await db
        .from("decisions")
        .update(payload)
        .eq("id", decision.id);

      if (updated.error) {
        throwDb(updated.error);
      }
    } else {
      const inserted = await db.from("decisions").insert({
        ...payload,
        meeting_id: meetingId,
      });

      if (inserted.error) {
        throwDb(inserted.error);
      }
    }
  }
}

async function syncActions(
  db: Parameters<Parameters<typeof withAdminDb>[0]>[0],
  meetingId: string,
  actions: Array<{
    id: string;
    title: string;
    description: string;
    responsiblePersonId: string;
    projectId: string;
    dueDate: string;
    status: string;
    priority: string;
  }>,
) {
  const linked = await db
    .from("tasks")
    .select("id")
    .eq("source_meeting_id", meetingId);

  if (linked.error) {
    throwDb(linked.error);
  }

  const keep = new Set(actions.map((action) => action.id).filter(Boolean));
  const unlink = ((linked.data ?? []) as Array<{ id: string }>)
    .map((task) => task.id)
    .filter((taskId) => !keep.has(taskId));

  if (unlink.length > 0) {
    const cleared = await db
      .from("tasks")
      .update({ source_meeting_id: null })
      .in("id", unlink);

    if (cleared.error) {
      throwDb(cleared.error);
    }
  }

  for (const action of actions) {
    const payload = {
      title: action.title.trim(),
      description: emptyToNull(action.description),
      project_id: action.projectId,
      responsible_person_id: action.responsiblePersonId,
      status: action.status,
      priority: action.priority,
      due_date: emptyToNull(action.dueDate),
      source_meeting_id: meetingId,
    };

    if (action.id) {
      const updated = await db.from("tasks").update(payload).eq("id", action.id);

      if (updated.error) {
        throwDb(updated.error);
      }
    } else {
      const inserted = await db.from("tasks").insert(payload);

      if (inserted.error) {
        throwDb(inserted.error);
      }
    }
  }
}
