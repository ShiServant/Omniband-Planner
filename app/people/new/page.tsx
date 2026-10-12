import type { Metadata } from "next";
import { PersonForm } from "@/components/person-form";
import { PageHeader } from "@/components/page-header";
import { requireEditPage } from "@/lib/admin/guard";

export const metadata: Metadata = {
  title: "New person",
};

export default async function NewPersonPage() {
  await requireEditPage("/people/new");

  return (
    <>
      <PageHeader
        title="New person"
        description="Add someone the committee can assign work to."
      />
      <PersonForm />
    </>
  );
}
