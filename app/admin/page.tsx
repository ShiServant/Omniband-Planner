import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminForm } from "@/components/admin-form";
import { PageHeader } from "@/components/page-header";
import { hasEditAccess } from "@/lib/admin/session";
import { safeReturnTo } from "@/lib/admin/token";
import { firstParam } from "@/lib/format";

export const metadata: Metadata = {
  title: "Edit",
};

export default async function AdminPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.searchParams;
  const returnTo = safeReturnTo(firstParam(params.returnTo) || "/");

  if (await hasEditAccess()) {
    redirect(returnTo);
  }

  return (
    <>
      <PageHeader
        title="Edit"
        description="Editing is shared by the committee. Enter the password to change records on this browser."
      />
      <AdminForm returnTo={returnTo} />
    </>
  );
}
