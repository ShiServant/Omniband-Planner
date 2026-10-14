import type { Metadata } from "next";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { MeetingForm } from "@/components/meeting-form";
import { PageHeader } from "@/components/page-header";
import { requireEditPage } from "@/lib/admin/guard";
import { listPeople } from "@/lib/data/people";
import { listProjects } from "@/lib/data/projects";
import { listTasks } from "@/lib/data/tasks";

export const metadata: Metadata = {
  title: "New meeting",
};

export default async function NewMeetingPage() {
  await requireEditPage("/meetings/new");
  const [people, projects, tasks] = await Promise.all([
    listPeople(),
    listProjects("all"),
    listTasks({ status: "all" }),
  ]);

  if (!people.configured || !projects.configured || !tasks.configured) {
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
        description="Record what was decided, and which actions came next."
        back={{ href: "/meetings", label: "Meetings" }}
      />
      <MeetingForm
        meetingLocal=""
        people={people.data}
        projects={projects.data}
        tasks={tasks.data}
      />
    </>
  );
}
