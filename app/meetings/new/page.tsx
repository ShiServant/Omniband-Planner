import type { Metadata } from "next";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { MeetingForm } from "@/components/meeting-form";
import { PageHeader } from "@/components/page-header";
import { requireEditPage } from "@/lib/admin/guard";
import { listProjects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "New meeting",
};

export default async function NewMeetingPage() {
  await requireEditPage("/meetings/new");
  const projects = await listProjects("all");

  if (!projects.configured) {
    return (
      <>
        <PageHeader
          title="New meeting"
          back={{ href: "/meetings", label: "Meetings" }}
        />
        <DatabaseUnavailable />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="New meeting"
        description="Record the meeting and attach any files."
        back={{ href: "/meetings", label: "Meetings" }}
      />
      <MeetingForm meetingLocal="" projects={projects.data} />
    </>
  );
}
