import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { EditLink } from "@/components/edit-link";
import { MeetingDetailView } from "@/components/meeting-detail";
import { PageHeader } from "@/components/page-header";
import { hasEditAccess } from "@/lib/admin/session";
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
  const [result, editing] = await Promise.all([getMeeting(id), hasEditAccess()]);

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
      <PageHeader
        title={result.data.title}
        action={
          editing ? (
            <EditLink href={`/meetings/${result.data.id}/edit`}>Edit</EditLink>
          ) : null
        }
      />
      <MeetingDetailView meeting={result.data} canEdit={editing} />
    </>
  );
}
