import "server-only";

import { cache } from "react";
import { failRead, one, type DataResult } from "@/lib/data/read";
import { listAttachments } from "@/lib/files";
import { isUuid } from "@/lib/format";
import { getReadClient } from "@/lib/supabase/read";
import type { MeetingDetail, MeetingSummary, NamedRef } from "@/lib/types";

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

type MeetingDetailRow = {
  id: string;
  title: string;
  meeting_date: string;
  summary: string | null;
  discussed: Array<{
    project: NamedRef | NamedRef[] | null;
  }> | null;
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
        files: await listMeetingFiles(client, id),
      },
    };
  },
);

function listMeetingFiles(
  client: NonNullable<ReturnType<typeof getReadClient>>,
  meetingId: string,
) {
  return listAttachments(client, "meeting_files", "meeting_id", meetingId);
}
