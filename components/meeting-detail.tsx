import { ProjectLink } from "@/components/record-link";
import { Section } from "@/components/section";
import { formatDateTime } from "@/lib/format";
import type { MeetingDetail } from "@/lib/types";

export function MeetingDetailView({ meeting }: { meeting: MeetingDetail }) {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        <time dateTime={meeting.meetingDate}>
          {formatDateTime(meeting.meetingDate)}
        </time>
      </p>

      <Section title="Projects discussed">
        {meeting.projects.length > 0 ? (
          <p className="text-sm">
            {meeting.projects.map((project, index) => (
              <span key={project.id}>
                {index > 0 ? ", " : null}
                <ProjectLink project={project} />
              </span>
            ))}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No projects were linked to this meeting.
          </p>
        )}
      </Section>

      <Section title="Summary">
        <p className="max-w-3xl text-sm leading-6 whitespace-pre-wrap">
          {meeting.summary || "No summary recorded."}
        </p>
      </Section>

      <Section title="Files">
        {meeting.files.length > 0 ? (
          <ul className="flex flex-col gap-2 text-sm">
            {meeting.files.map((file) => (
              <li key={file.id}>
                <a
                  href={`/meetings/${meeting.id}/files/${file.id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {file.fileName}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No files attached.</p>
        )}
      </Section>
    </>
  );
}
