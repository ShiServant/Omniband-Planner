import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="All current, completed, and archived projects."
      />
      <EmptyState>No projects yet.</EmptyState>
    </>
  );
}
