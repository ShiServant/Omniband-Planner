import { DeleteProjectButton } from "@/components/delete-project-button";
import { PersonLink, ProjectLink } from "@/components/record-link";
import {
  ProjectStatusBadge,
} from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { ProjectSummary } from "@/lib/types";

export function ProjectSummaryList({
  projects,
  variant = "full",
  canEdit = false,
}: {
  projects: ProjectSummary[];
  variant?: "full" | "compact";
  canEdit?: boolean;
}) {
  return (
    <div className="divide-y rounded-lg border">
      {projects.map((project) => (
        <article key={project.id} className="px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ProjectLink project={project} className="font-medium" />
            <div className="flex flex-wrap items-center gap-2">
              {canEdit ? (
                <DeleteProjectButton id={project.id} name={project.name} />
              ) : null}
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>
          {variant === "full" ? (
            <FullMeta project={project} />
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Lead <PersonLink person={project.lead} />
              <span aria-hidden> · </span>
              Updated {formatDate(project.updatedAt)}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function FullMeta({ project }: { project: ProjectSummary }) {
  const parts = [
    <>
      Lead <PersonLink person={project.lead} />
    </>,
  ];

  if (project.dueDate) {
    parts.push(<>Due {formatDate(project.dueDate)}</>);
  }

  return (
    <>
      <p className="mt-1 text-sm text-muted-foreground">
        {parts.map((part, index) => (
          <span key={index}>
            {index > 0 ? <span aria-hidden> · </span> : null}
            {part}
          </span>
        ))}
      </p>
    </>
  );
}
