import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { MeetingForm } from "@/components/meeting-form";
import { PageHeader } from "@/components/page-header";
import { DeleteMeetingButton } from "@/components/delete-meeting-button";
import { requireEditPage } from "@/lib/admin/guard";
import { listProjects } from "@/lib/data/projects";
import { getMeeting } from "@/lib/data/meetings";
import { toDateTimeLocal } from "@/lib/format";

export const metadata: Metadata = {
  title: "Edit meeting",
};

export default async function EditMeetingPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  await requireEditPage(`/meetings/${id}/edit`);
  const [meeting, projects] = await Promise.all([
    getMeeting(id),
    listProjects("all"),
  ]);

  if (!meeting.configured || !projects.configured) {
    return (
      <>
        <PageHeader
          title="Edit meeting"
          back={{ href: "/meetings", label: "Meetings" }}
        />
        <DatabaseUnavailable />
      </>
    );
  }

  if (!meeting.data) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`Edit ${meeting.data.title}`}
        back={{ href: `/meetings/${meeting.data.id}`, label: "Meeting" }}
      />
      <MeetingForm
        meeting={meeting.data}
        meetingLocal={toDateTimeLocal(meeting.data.meetingDate)}
        projects={projects.data}
      />
      <div className="mt-8">
        <DeleteMeetingButton id={meeting.data.id} title={meeting.data.title} />
      </div>
    </>
  );
}
