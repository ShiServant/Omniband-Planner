import { PersonLink, ProjectLink } from "@/components/record-link";
import { Section } from "@/components/section";
import { TaskList } from "@/components/task-list";
import { formatDateTime } from "@/lib/format";
import type { MeetingDetail } from "@/lib/types";

export function MeetingDetailView({
  meeting,
  canEdit = false,
}: {
  meeting: MeetingDetail;
  canEdit?: boolean;
}) {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        <time dateTime={meeting.meetingDate}>
          {formatDateTime(meeting.meetingDate)}
        </time>
      </p>

      <Section title="Attendees">
        {meeting.attendees.length > 0 ? (
          <p className="text-sm">
            {meeting.attendees.map((person, index) => (
              <span key={person.id}>
                {index > 0 ? ", " : null}
                <PersonLink person={person} />
                {person.societyRole ? (
                  <span className="text-muted-foreground">
                    {" "}
                    ({person.societyRole})
                  </span>
                ) : null}
              </span>
            ))}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No attendees recorded.</p>
        )}
      </Section>

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

      <Section title="Discussion notes">
        <p className="max-w-3xl text-sm leading-6 whitespace-pre-wrap">
          {meeting.discussionNotes || "No discussion notes recorded."}
        </p>
      </Section>

      <Section title="Decisions" prominent>
        {meeting.decisions.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {meeting.decisions.map((decision) => (
              <li key={decision.id} className="px-4 py-4">
                <p className="font-medium">{decision.content}</p>
                {decision.project ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <ProjectLink project={decision.project} />
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No decisions recorded.</p>
        )}
      </Section>

      <Section title="Action items" prominent>
        {meeting.tasks.length > 0 ? (
          <TaskList tasks={meeting.tasks} showSource={false} canEdit={canEdit} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No action items came out of this meeting.
          </p>
        )}
      </Section>
    </>
  );
}
