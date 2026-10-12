import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Tasks"
        description="Actions that need to happen, and the person responsible for each one."
      />
      <EmptyState>No tasks yet.</EmptyState>
    </>
  );
}
