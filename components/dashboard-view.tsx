import { ProjectSummaryList } from "@/components/project-summary-list";
import { MeetingLink, ProjectLink } from "@/components/record-link";
import { Section } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { TaskList } from "@/components/task-list";
import { formatDate } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

export function DashboardView({ data }: { data: DashboardData }) {
  const counts = [
    { label: "Active projects", value: data.counts.active },
    { label: "On track", value: data.counts.onTrack },
    { label: "Needs attention", value: data.counts.needsAttention },
    { label: "Blocked", value: data.counts.blocked },
  ];

  return (
    <>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
        {counts.map((count) => (
          <div key={count.label} className="bg-background px-4 py-3">
            <dt className="text-xs text-muted-foreground">{count.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              {count.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">
        On track, needs attention, and blocked count the active projects.
      </p>

      <Section title="Active projects" prominent>
        {data.activeProjects.length > 0 ? (
          <ProjectSummaryList projects={data.activeProjects} />
        ) : (
          <p className="text-sm text-muted-foreground">No active projects.</p>
        )}
      </Section>

      <Section title="Needs attention and blocked" prominent>
        {data.attentionProjects.length > 0 ? (
          <ProjectSummaryList projects={data.attentionProjects} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing is blocked or needs attention.
          </p>
        )}
      </Section>

      <Section title="Upcoming milestones and deadlines" prominent>
        {data.upcoming.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {data.upcoming.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
              >
                <div>
                  <ProjectLink
                    project={{ id: item.projectId, name: item.title }}
                    className="font-medium"
                  />
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <p className="flex items-center gap-2 text-sm">
                  {item.overdue ? (
                    <StatusBadge tone="bad">Overdue</StatusBadge>
                  ) : null}
                  <span>{formatDate(item.dueDate)}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing is due in the next 14 days.
          </p>
        )}
      </Section>

      <Section title="Important outstanding tasks" prominent>
        {data.importantTasks.length > 0 ? (
          <TaskList tasks={data.importantTasks} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No high-priority or soon-due tasks.
          </p>
        )}
      </Section>

      <Section title="Recent decisions" prominent>
        {data.recentDecisions.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {data.recentDecisions.map((decision) => (
              <li key={decision.id} className="px-4 py-4">
                <p className="font-medium">{decision.content}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <MeetingLink meeting={decision.meeting} />
                  <span aria-hidden> · </span>
                  {formatDate(decision.meeting.meetingDate)}
                  {decision.project ? (
                    <>
                      <span aria-hidden> · </span>
                      <ProjectLink project={decision.project} />
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No decisions recorded.</p>
        )}
      </Section>

      <Section title="Recently updated projects" prominent>
        {data.recentProjects.length > 0 ? (
          <ProjectSummaryList projects={data.recentProjects} variant="compact" />
        ) : (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        )}
      </Section>
    </>
  );
}
