import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { DeleteProjectButton } from "@/components/delete-project-button";
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
          description="What this project is, and who is on it."
          back={{ href: "/projects", label: "Projects" }}
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
        back={{ href: "/projects", label: "Projects" }}
        action={
          editing ? (
            <div className="flex items-center gap-2">
              <EditLink href={`/projects/${result.data.id}/edit`}>Edit</EditLink>
              <DeleteProjectButton id={result.data.id} name={result.data.name} />
            </div>
          ) : null
        }
      />
      <ProjectDetailView project={result.data} canEdit={editing} />
    </>
  );
}
