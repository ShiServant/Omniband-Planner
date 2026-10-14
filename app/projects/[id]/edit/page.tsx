import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/project-form";
import { requireEditPage } from "@/lib/admin/guard";
import { listPeople } from "@/lib/data/people";
import { getProject } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Edit project",
};

export default async function EditProjectPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  await requireEditPage(`/projects/${id}/edit`);
  const [project, people] = await Promise.all([getProject(id), listPeople()]);

  if (!project.configured || !people.configured) {
    return (
      <>
        <PageHeader
          title="Edit project"
          back={{ href: "/projects", label: "Projects" }}
        />
        <DatabaseUnavailable />
      </>
    );
  }

  if (!project.data) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`Edit ${project.data.name}`}
        back={{ href: `/projects/${project.data.id}`, label: "Project" }}
      />
      <ProjectForm project={project.data} people={people.data} />
    </>
  );
}
