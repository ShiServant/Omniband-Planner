import type { Metadata } from "next";
import Link from "next/link";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { DeleteMeetingButton } from "@/components/delete-meeting-button";
import { EditLink } from "@/components/edit-link";
import { PageHeader } from "@/components/page-header";
import { ProjectLink } from "@/components/record-link";
import { hasEditAccess } from "@/lib/admin/session";
import { listMeetings } from "@/lib/data/meetings";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Meetings",
};

export default async function MeetingsPage() {
  const [result, editing] = await Promise.all([
    listMeetings(),
    hasEditAccess(),
  ]);

  return (
    <>
      <PageHeader
        title="Meetings"
        description="What was discussed, and which files were kept."
        action={
          editing ? <EditLink href="/meetings/new">Add meeting</EditLink> : null
        }
      />
      {result.configured ? (
        result.data.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {result.data.map((meeting) => (
              <li key={meeting.id} className="px-4 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {meeting.title}
                  </Link>
                  <div className="flex items-center gap-3">
                    {editing ? (
                      <DeleteMeetingButton id={meeting.id} title={meeting.title} />
                    ) : null}
                    <time
                      dateTime={meeting.meetingDate}
                      className="text-sm text-muted-foreground"
                    >
                      {formatDateTime(meeting.meetingDate)}
                    </time>
                  </div>
                </div>
                {meeting.projects.length > 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {meeting.projects.map((project, index) => (
                      <span key={project.id}>
                        {index > 0 ? ", " : null}
                        <ProjectLink project={project} />
                      </span>
                    ))}
                  </p>
                ) : null}
                {meeting.summary ? (
                  <p className="mt-2 max-w-3xl text-sm">{meeting.summary}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No meetings yet.</p>
        )
      ) : (
        <DatabaseUnavailable />
      )}
    </>
  );
}
