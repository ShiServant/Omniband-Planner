import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { MeetingForm } from "@/components/meeting-form";
import { PageHeader } from "@/components/page-header";
import { requireEditPage } from "@/lib/admin/guard";
import { listPeople } from "@/lib/data/people";
import { listProjects } from "@/lib/data/projects";
import { getMeeting } from "@/lib/data/meetings";
import { listTasks } from "@/lib/data/tasks";
import { toDateTimeLocal } from "@/lib/format";

export const metadata: Metadata = {
  title: "Edit meeting",
};

export default async function EditMeetingPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  await requireEditPage(`/meetings/${id}/edit`);
  const [meeting, people, projects, tasks] = await Promise.all([
    getMeeting(id),
    listPeople(),
    listProjects("all"),
    listTasks({ status: "all" }),
  ]);

  if (
    !meeting.configured ||
    !people.configured ||
    !projects.configured ||
    !tasks.configured
  ) {
    return (
      <>
        <PageHeader title="Edit meeting" />
        <DatabaseUnavailable />
      </>
    );
  }

  if (!meeting.data) {
    notFound();
  }

  return (
    <>
      <PageHeader title={`Edit ${meeting.data.title}`} />
      <MeetingForm
        meeting={meeting.data}
        meetingLocal={toDateTimeLocal(meeting.data.meetingDate)}
        people={people.data}
        projects={projects.data}
        tasks={tasks.data}
      />
    </>
  );
}
