"use client";

import { useActionState } from "react";
import { saveTask } from "@/lib/actions/tasks";
import {
  Field,
  FormActions,
  FormError,
  inputClass,
  personOptionLabel,
  textareaClass,
} from "@/components/form-fields";
import { priorityLabel, taskStatusLabel } from "@/lib/labels";
import type {
  PersonSummary,
  ProjectSummary,
  TaskPriority,
  TaskStatus,
  TaskSummary,
} from "@/lib/types";

const statuses: TaskStatus[] = ["to_do", "in_progress", "blocked", "done"];
const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

export function TaskForm({
  task,
  people,
  projects,
  defaultProjectId = "",
}: {
  task?: TaskSummary;
  people: PersonSummary[];
  projects: ProjectSummary[];
  defaultProjectId?: string;
}) {
  const [state, action, pending] = useActionState(saveTask, null);
  const responsibleOptions = people.filter(
    (person) => person.active || person.id === task?.responsible.id,
  );
  const projectId = task?.project.id ?? defaultProjectId;

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {task ? <input type="hidden" name="id" value={task.id} /> : null}
      <Field label="Title">
        <input
          name="title"
          required
          defaultValue={task?.title ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          defaultValue={task?.description ?? ""}
          className={textareaClass}
        />
      </Field>
      <Field label="Project">
        <select
          name="projectId"
          required
          defaultValue={projectId}
          className={inputClass}
        >
          <option value="">Choose a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Responsible">
        <select
          name="responsiblePersonId"
          required
          defaultValue={task?.responsible.id ?? ""}
          className={inputClass}
        >
          <option value="">Choose a person</option>
          {responsibleOptions.map((person) => (
            <option key={person.id} value={person.id}>
              {personOptionLabel(person)}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            name="status"
            defaultValue={task?.status ?? "to_do"}
            className={inputClass}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabel(status)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select
            name="priority"
            defaultValue={task?.priority ?? "medium"}
            className={inputClass}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabel(priority)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Due date">
        <input
          name="dueDate"
          type="date"
          defaultValue={task?.dueDate ?? ""}
          className={inputClass}
        />
      </Field>
      <FormError message={state?.error} />
      <FormActions
        pending={pending}
        cancelHref={projectId ? `/projects/${projectId}` : "/tasks"}
      />
    </form>
  );
}
