import { MeetingLink, PersonLink, ProjectLink } from "@/components/record-link";
import { PriorityBadge, TaskStatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { TaskSummary } from "@/lib/types";

export function TaskList({
  tasks,
  showProject = true,
  showResponsible = true,
  showSource = true,
}: {
  tasks: TaskSummary[];
  showProject?: boolean;
  showResponsible?: boolean;
  showSource?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Task</th>
            {showProject ? (
              <th className="px-4 py-2 font-medium">Project</th>
            ) : null}
            {showResponsible ? (
              <th className="px-4 py-2 font-medium">Responsible</th>
            ) : null}
            <th className="px-4 py-2 font-medium">Due</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Priority</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.map((task) => (
            <tr key={task.id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-medium">{task.title}</p>
                {task.description ? (
                  <p className="mt-1 max-w-md text-muted-foreground">
                    {task.description}
                  </p>
                ) : null}
                {showSource && task.sourceMeeting ? (
                  <p className="mt-1 text-muted-foreground">
                    From <MeetingLink meeting={task.sourceMeeting} />
                  </p>
                ) : null}
              </td>
              {showProject ? (
                <td className="px-4 py-3">
                  <ProjectLink project={task.project} />
                </td>
              ) : null}
              {showResponsible ? (
                <td className="px-4 py-3">
                  <PersonLink person={task.responsible} />
                </td>
              ) : null}
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(task.dueDate) ?? "No date"}
              </td>
              <td className="px-4 py-3">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={task.priority} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
