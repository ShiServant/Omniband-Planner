import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { PageHeader } from "@/components/page-header";
import { ProjectDetailView } from "@/components/project-detail";
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
  const result = await getProject(id);

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
      <PageHeader title={result.data.name} />
      <ProjectDetailView project={result.data} />
    </>
  );
}
