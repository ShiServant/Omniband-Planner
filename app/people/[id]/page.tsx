import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { PageHeader } from "@/components/page-header";
import { PersonDetailView } from "@/components/person-detail";
import { getPerson } from "@/lib/data/people";

export async function generateMetadata(
  props: PageProps<"/people/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const result = await getPerson(id);

  if (!result.configured) {
    return { title: "Person" };
  }

  if (!result.data) {
    return { title: "Not found" };
  }

  return { title: result.data.name };
}

export default async function PersonPage(props: PageProps<"/people/[id]">) {
  const { id } = await props.params;
  const result = await getPerson(id);

  if (!result.configured) {
    return (
      <>
        <PageHeader
          title="Person"
          description="Who this person is, which projects they are on, and what they are responsible for."
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
      <PageHeader title={result.data.name} />
      <PersonDetailView person={result.data} />
    </>
  );
}
