import type { Metadata } from "next";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { EditLink } from "@/components/edit-link";
import { PageHeader } from "@/components/page-header";
import { ProjectSummaryList } from "@/components/project-summary-list";
import { ProjectViewNav } from "@/components/project-view-nav";
import { hasEditAccess } from "@/lib/admin/session";
import { listProjects, type ProjectView } from "@/lib/data/projects";
import { firstParam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Projects",
};

const views = new Set<Exclude<ProjectView, "all">>([
  "active",
  "completed",
  "archived",
]);

export default async function ProjectsPage(
  props: PageProps<"/projects">,
) {
  const params = await props.searchParams;
  const requested = firstParam(params.view);
  const view = views.has(requested as Exclude<ProjectView, "all">)
    ? (requested as Exclude<ProjectView, "all">)
    : "active";
  const [result, editing] = await Promise.all([
    listProjects(view),
    hasEditAccess(),
  ]);
  const empty =
    view === "active"
      ? "No active projects."
      : view === "completed"
        ? "No completed projects."
        : "No archived projects.";

  return (
    <>
      <PageHeader
        title="Projects"
        description="All current, completed, and archived projects."
        action={editing ? <EditLink href="/projects/new">Add project</EditLink> : null}
      />
      {result.configured ? (
        <>
          <ProjectViewNav view={view} />
          {result.data.length > 0 ? (
            <ProjectSummaryList projects={result.data} />
          ) : (
            <p className="text-sm text-muted-foreground">{empty}</p>
          )}
        </>
      ) : (
        <DatabaseUnavailable />
      )}
    </>
  );
}
