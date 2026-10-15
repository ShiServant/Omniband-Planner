import Link from "next/link";
import { cn } from "cn";
import { markTaskDone } from "@/lib/actions/tasks";
import { DeleteTaskButton } from "@/components/delete-task-button";
import { FileLinks } from "@/components/file-links";
import { Button, buttonVariants } from "@/components/ui/button";
import { MeetingLink, PersonLinks, ProjectLink } from "@/components/record-link";
import { PriorityBadge, TaskStatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { TaskSummary } from "@/lib/types";

export function TaskList({
  tasks,
  showProject = true,
  showResponsible = true,
  showSource = true,
  canEdit = false,
  canDelete = true,
  highlightImportant = false,
}: {
  tasks: TaskSummary[];
  showProject?: boolean;
  showResponsible?: boolean;
  showSource?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  highlightImportant?: boolean;
}) {
  if (highlightImportant) {
    return (
      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={cn(
              "rounded-lg border px-4 py-3",
              task.important && "border-2 border-red-600",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {task.title}
                  {task.important ? (
                    <span className="ml-2 text-xs font-medium text-red-700">
                      Important
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {showResponsible ? (
                    <PersonLinks people={task.responsibles} />
                  ) : null}
                  {showResponsible && showProject ? <span aria-hidden> · </span> : null}
                  {showProject ? <ProjectLink project={task.project} /> : null}
                  <span aria-hidden> · </span>
                  {formatDate(task.dueDate) ?? "No date"}
                </p>
                <FileLinks
                  files={task.files}
                  href={(fileId) => `/tasks/${task.id}/files/${fileId}`}
                />
              </div>
              <TaskStatusBadge status={task.status} />
            </div>
            {canEdit ? (
              <TaskActions task={task} canDelete={canDelete} className="mt-3" />
            ) : null}
          </li>
        ))}
      </ul>
    );
  }

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
            {canEdit ? (
              <th className="px-4 py-2 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.map((task) => (
            <tr key={task.id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-medium">
                  {task.title}
                  {task.important ? (
                    <span className="ml-2 text-xs font-medium text-red-700">
                      Important
                    </span>
                  ) : null}
                </p>
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
                <FileLinks
                  files={task.files}
                  href={(fileId) => `/tasks/${task.id}/files/${fileId}`}
                />
              </td>
              {showProject ? (
                <td className="px-4 py-3">
                  <ProjectLink project={task.project} />
                </td>
              ) : null}
              {showResponsible ? (
                <td className="px-4 py-3">
                  <PersonLinks people={task.responsibles} />
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
              {canEdit ? (
                <td className="px-4 py-3">
                  <TaskActions task={task} canDelete={canDelete} />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TaskActions({
  task,
  canDelete,
  className,
}: {
  task: TaskSummary;
  canDelete: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Link
        href={`/tasks/${task.id}/edit`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Edit
      </Link>
      {task.status !== "done" ? (
        <form action={markTaskDone}>
          <input type="hidden" name="id" value={task.id} />
          <Button type="submit" variant="outline" size="sm">
            Mark done
          </Button>
        </form>
      ) : null}
      {canDelete ? <DeleteTaskButton id={task.id} title={task.title} /> : null}
    </div>
  );
}
