import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "People",
};

export default function PeoplePage() {
  return (
    <>
      <PageHeader
        title="People"
        description="Society members, the projects they lead, and the work they are responsible for."
      />
      <EmptyState>No people yet.</EmptyState>
    </>
  );
}
