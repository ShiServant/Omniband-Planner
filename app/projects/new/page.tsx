import type { Metadata } from "next";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/project-form";
import { requireEditPage } from "@/lib/admin/guard";
import { listPeople } from "@/lib/data/people";

export const metadata: Metadata = {
  title: "New project",
};

export default async function NewProjectPage() {
  await requireEditPage("/projects/new");
  const people = await listPeople();

  return (
    <>
      <PageHeader
        title="New project"
        description="Record what is happening, who leads it, and what comes next."
      />
      {!people.configured ? (
        <DatabaseUnavailable />
      ) : people.data.some((person) => person.active) ? (
        <ProjectForm people={people.data} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Add an active person before creating a project.
        </p>
      )}
    </>
  );
}
