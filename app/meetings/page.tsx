import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Meetings",
};

export default function MeetingsPage() {
  return (
    <>
      <PageHeader
        title="Meetings"
        description="What was discussed, what was decided, and which actions came next."
      />
      <EmptyState>No meetings yet.</EmptyState>
    </>
  );
}
