import { ActiveProjects } from "@/components/active-projects";
import { MonthCalendar } from "@/components/month-calendar";
import { ProjectLink } from "@/components/record-link";
import { Section } from "@/components/section";
import { StatusBadge } from "@/components/status-badge";
import { TaskList } from "@/components/task-list";
import { formatDate } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

export function DashboardView({
  data,
  canEdit = false,
}: {
  data: DashboardData;
  canEdit?: boolean;
}) {
  return (
    <>
      <Section title="Calendar" prominent>
        <MonthCalendar today={data.today} entries={data.calendar} />
      </Section>

      <Section title="Upcoming deadlines" prominent>
        {data.upcoming.length > 0 ? (
          <ul className="divide-y rounded-lg border">
            {data.upcoming.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
              >
                <div>
                  {item.taskId ? (
                    <p className="font-medium">{item.title}</p>
                  ) : (
                    <ProjectLink
                      project={{ id: item.projectId, name: item.title }}
                      className="font-medium"
                    />
                  )}
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {item.overdue ? (
                    <StatusBadge tone="bad">Overdue</StatusBadge>
                  ) : null}
                  <span>{formatDate(item.dueDate)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing is due in the next 14 days.
          </p>
        )}
      </Section>

      <Section title="Tasks" prominent>
        {data.tasks.length > 0 ? (
          <TaskList
            tasks={data.tasks}
            canEdit={canEdit}
            canDelete={false}
            highlightImportant
          />
        ) : (
          <p className="text-sm text-muted-foreground">No tasks in progress.</p>
        )}
      </Section>

      <Section title="Active projects" prominent>
        {data.activeProjects.length > 0 ? (
          <ActiveProjects projects={data.activeProjects} />
        ) : (
          <p className="text-sm text-muted-foreground">No active projects.</p>
        )}
      </Section>
    </>
  );
}
