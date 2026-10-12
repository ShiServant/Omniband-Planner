import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getSiteName } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `Dashboard · ${getSiteName()}`,
  },
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What is happening across the society, and who is responsible."
      />
      <EmptyState>No activity recorded yet.</EmptyState>
    </>
  );
}
