import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/database-unavailable";
import { DeleteMeetingButton } from "@/components/delete-meeting-button";
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
          description="What was discussed, and which files were kept."
          back={{ href: "/meetings", label: "Meetings" }}
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
        back={{ href: "/meetings", label: "Meetings" }}
        action={
          editing ? (
            <div className="flex items-center gap-2">
              <DeleteMeetingButton
                id={result.data.id}
                title={result.data.title}
              />
              <EditLink href={`/meetings/${result.data.id}/edit`}>Edit</EditLink>
            </div>
          ) : null
        }
      />
      <MeetingDetailView meeting={result.data} />
    </>
  );
}
