import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { requireEditPage } from "@/lib/admin/guard";
import { listPeople } from "@/lib/data/people";
import { listProjects } from "@/lib/data/projects";
import { getTask } from "@/lib/data/tasks";

export const metadata: Metadata = {
  title: "Edit task",
};

export default async function EditTaskPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  await requireEditPage(`/tasks/${id}/edit`);
  const [task, people, projects] = await Promise.all([
    getTask(id),
    listPeople(),
    listProjects("all"),
  ]);

  if (!task.configured || !people.configured || !projects.configured) {
    return (
      <>
        <PageHeader
          title="Edit task"
          back={{ href: "/tasks", label: "Tasks" }}
        />
        <DatabaseUnavailable />
      </>
    );
  }

  if (!task.data) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`Edit ${task.data.title}`}
        back={{ href: "/tasks", label: "Tasks" }}
      />
      <TaskForm task={task.data} people={people.data} projects={projects.data} />
    </>
  );
}
