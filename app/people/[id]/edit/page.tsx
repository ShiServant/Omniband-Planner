import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { PageHeader } from "@/components/page-header";
import { PersonForm } from "@/components/person-form";
import { requireEditPage } from "@/lib/admin/guard";
import { getPerson } from "@/lib/data/people";

export const metadata: Metadata = {
  title: "Edit person",
};

export default async function EditPersonPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  await requireEditPage(`/people/${id}/edit`);
  const result = await getPerson(id);

  if (!result.configured) {
    return (
      <>
        <PageHeader
          title="Edit person"
          back={{ href: "/people", label: "People" }}
        />
        <DatabaseUnavailable />
      </>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={`Edit ${result.data.name}`}
        back={{ href: `/people/${result.data.id}`, label: "Person" }}
      />
      <PersonForm person={result.data} />
    </>
  );
}
