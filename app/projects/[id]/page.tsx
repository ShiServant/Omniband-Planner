import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { EditLink } from "@/components/edit-link";
import { PageHeader } from "@/components/page-header";
import { ProjectDetailView } from "@/components/project-detail";
import { hasEditAccess } from "@/lib/admin/session";
import { getProject } from "@/lib/data/projects";

export async function generateMetadata(
  props: PageProps<"/projects/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const result = await getProject(id);

  if (!result.configured) {
    return { title: "Project" };
  }

  if (!result.data) {
    return { title: "Not found" };
  }

  return { title: result.data.name };
}

export default async function ProjectPage(props: PageProps<"/projects/[id]">) {
  const { id } = await props.params;
  const [result, editing] = await Promise.all([getProject(id), hasEditAccess()]);

  if (!result.configured) {
    return (
      <>
        <PageHeader
          title="Project"
          description="What this project is, who leads it, and what happens next."
        />
        <DatabaseUnavailable />
      </>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={result.data.name}
        action={
          editing ? (
            <EditLink href={`/projects/${result.data.id}/edit`}>Edit</EditLink>
          ) : null
        }
      />
      <ProjectDetailView project={result.data} canEdit={editing} />
    </>
  );
}
