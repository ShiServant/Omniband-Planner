import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { MeetingDetailView } from "@/components/meeting-detail";
import { PageHeader } from "@/components/page-header";
import { getMeeting } from "@/lib/data/meetings";

export async function generateMetadata(
  props: PageProps<"/meetings/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const result = await getMeeting(id);

  if (!result.configured) {
    return { title: "Meeting" };
  }

  if (!result.data) {
    return { title: "Not found" };
  }

  return { title: result.data.title };
}

export default async function MeetingPage(props: PageProps<"/meetings/[id]">) {
  const { id } = await props.params;
  const result = await getMeeting(id);

  if (!result.configured) {
    return (
      <>
        <PageHeader
          title="Meeting"
          description="Who attended, what was decided, and which actions came next."
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
      <PageHeader title={result.data.title} />
      <MeetingDetailView meeting={result.data} />
    </>
  );
}
