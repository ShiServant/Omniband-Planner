import "server-only";

import { cache } from "react";
import { failRead, one, type DataResult } from "@/lib/data/read";
import { isUuid } from "@/lib/format";
import { getReadClient } from "@/lib/supabase/read";
import { compareTasks, mapTask, type TaskRow } from "@/lib/data/tasks";
import type { DecisionSummary, MeetingDetail, MeetingFile, MeetingSummary, NamedRef } from "@/lib/types";

type MeetingRow = {
  id: string;
  title: string;
  meeting_date: string;
  summary: string | null;
  discussed: Array<{
    project: NamedRef | NamedRef[] | null;
  }> | null;
};

export async function listMeetings(): Promise<DataResult<MeetingSummary[]>> {
  const client = getReadClient();

  if (!client) {
    return { configured: false };
  }

  const { data, error } = await client
    .from("meetings")
    .select(
      `
      id,
      title,
      meeting_date,
      summary,
      discussed:meeting_projects (
        project:projects!project_id (id, name)
      )
    `,
    )
    .order("meeting_date", { ascending: false });

  if (error) {
    failRead("meetings", error.message);
  }

  return {
    configured: true,
    data: ((data ?? []) as MeetingRow[]).map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      meetingDate: meeting.meeting_date,
      summary: meeting.summary,
      projects: (meeting.discussed ?? []).flatMap((item) => {
        const project = one(item.project);
        return project ? [project] : [];
      }),
    })),
  };
}

type DecisionRow = {
  id: string;
  content: string;
  created_at: string;
  project: NamedRef | NamedRef[] | null;
  meeting: {
    id: string;
    title: string;
    meeting_date: string;
  } | Array<{
    id: string;
    title: string;
    meeting_date: string;
  }> | null;
};

export async function listDecisions(): Promise<DataResult<DecisionSummary[]>> {
  const client = getReadClient();

  if (!client) {
    return { configured: false };
  }

  const { data, error } = await client.from("decisions").select(`
    id,
    content,
    created_at,
    project:projects!project_id (id, name),
    meeting:meetings!meeting_id (id, title, meeting_date)
  `);

  if (error) {
    failRead("decisions", error.message);
  }

  return {
    configured: true,
    data: ((data ?? []) as DecisionRow[]).flatMap((decision) => {
      const meeting = one(decision.meeting);

      if (!meeting) {
        return [];
      }

      return [
        {
          id: decision.id,
          content: decision.content,
          createdAt: decision.created_at,
          meeting: {
            id: meeting.id,
            title: meeting.title,
            meetingDate: meeting.meeting_date,
          },
          project: one(decision.project),
        },
      ];
    }),
  };
}

type MeetingDetailRow = {
  id: string;
  title: string;
  meeting_date: string;
  summary: string | null;
  discussed: Array<{
    project: NamedRef | NamedRef[] | null;
  }> | null;
  decisions: Array<{
    id: string;
    content: string;
    created_at: string;
    project: NamedRef | NamedRef[] | null;
  }> | null;
  tasks: TaskRow[] | null;
};

export const getMeeting = cache(
  async (id: string): Promise<DataResult<MeetingDetail | null>> => {
    if (!isUuid(id)) {
      return { configured: true, data: null };
    }

    const client = getReadClient();

    if (!client) {
      return { configured: false };
    }

    const { data, error } = await client
      .from("meetings")
      .select(
        `
        id,
        title,
        meeting_date,
        summary,
        discussed:meeting_projects (
          project:projects!project_id (id, name)
        ),
        decisions (
          id,
          content,
          created_at,
          project:projects!project_id (id, name)
        ),
        tasks (
          id,
          title,
          description,
          status,
          priority,
          due_date,
          project:projects!project_id (id, name),
          responsible:people!responsible_person_id (id, name),
          source_meeting:meetings!source_meeting_id (id, title)
        )
      `,
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      failRead("meeting", error.message);
    }

    if (!data) {
      return { configured: true, data: null };
    }

    const meeting = data as MeetingDetailRow;

    return {
      configured: true,
      data: {
        id: meeting.id,
        title: meeting.title,
        meetingDate: meeting.meeting_date,
        summary: meeting.summary,
        projects: (meeting.discussed ?? []).flatMap((item) => {
          const project = one(item.project);
          return project ? [project] : [];
        }),
        decisions: [...(meeting.decisions ?? [])]
          .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
          .map((decision) => ({
            id: decision.id,
            content: decision.content,
            project: one(decision.project),
          })),
        tasks: (meeting.tasks ?? []).map(mapTask).sort(compareTasks),
        files: await listMeetingFiles(client, id),
      },
    };
  },
);

async function listMeetingFiles(
  client: NonNullable<ReturnType<typeof getReadClient>>,
  meetingId: string,
): Promise<MeetingFile[]> {
  const { data, error } = await client
    .from("meeting_files")
    .select("id, file_name")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return ((data ?? []) as Array<{ id: string; file_name: string }>).map(
    (file) => ({
      id: file.id,
      fileName: file.file_name,
    }),
  );
}
