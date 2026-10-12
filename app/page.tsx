import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard-view";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { PageHeader } from "@/components/page-header";
import { getDashboard } from "@/lib/data/dashboard";
import { getSiteName } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `Dashboard · ${getSiteName()}`,
  },
};

export default async function DashboardPage() {
  const result = await getDashboard();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What is happening across the society, and who is responsible."
      />
      {result.configured ? (
        <DashboardView data={result.data} />
      ) : (
        <DatabaseUnavailable />
      )}
    </>
  );
}
