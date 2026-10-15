"use client";

import { saveTask } from "@/lib/actions/tasks";
import { RecordFiles, useRecordFiles } from "@/components/record-files";
import { DeleteTaskButton } from "@/components/delete-task-button";
import {
  Field,
  SaveStatus,
  inputClass,
  personOptionLabel,
  textareaClass,
} from "@/components/form-fields";
import { useAutosave } from "@/components/use-autosave";
import type { ActionState } from "@/lib/action-state";
import { priorityLabel, taskStatusLabel } from "@/lib/labels";
import type {
  PersonSummary,
  ProjectSummary,
  TaskPriority,
  TaskStatus,
  TaskSummary,
} from "@/lib/types";

const statuses: TaskStatus[] = ["in_progress", "done"];
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
  const files = useRecordFiles();
  const { formRef, phase, error, schedule } = useAutosave(
    async (previous: ActionState, formData: FormData) => {
      const taken = files.take(formData);
      const result = await saveTask(previous, formData);

      if (result?.error) {
        files.restore(taken);
        return result;
      }

      files.clear();
      return result;
    },
    (id) => `/tasks/${id}/edit`,
  );
  const selectedResponsibles = new Set(
    task?.responsibles.map((person) => person.id) ?? [],
  );
  const responsibleOptions = people.filter(
    (person) => person.active || selectedResponsibles.has(person.id),
  );
  const projectId = task?.project.id ?? defaultProjectId;

  return (
    <div className="flex max-w-xl flex-col gap-8">
    <form
      ref={formRef}
      className="flex flex-col gap-4"
      onInput={schedule}
      onChange={schedule}
    >
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
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Responsible</legend>
        {responsibleOptions.map((person) => (
          <label key={person.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="responsiblePersonId"
              value={person.id}
              defaultChecked={selectedResponsibles.has(person.id)}
            />
            {personOptionLabel(person)}
          </label>
        ))}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            name="status"
            defaultValue={task?.status === "done" ? "done" : "in_progress"}
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
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="important"
          value="true"
          defaultChecked={task?.important ?? false}
        />
        Important
      </label>
      <p className="-mt-2 text-xs text-muted-foreground">
        Important tasks appear first on the dashboard, inside a red border.
      </p>
      <Field label="Due date">
        <input
          name="dueDate"
          type="date"
          defaultValue={task?.dueDate ?? ""}
          className={inputClass}
        />
      </Field>
      <RecordFiles
        files={task?.files ?? []}
        recordId={task?.id}
        downloadPath={(id, fileId) => `/tasks/${id}/files/${fileId}`}
        pending={files}
        onChange={schedule}
      />
      <SaveStatus phase={phase} error={error} />
    </form>
    {task ? (
      <DeleteTaskButton
        id={task.id}
        title={task.title}
        returnTo={task.project.id ? `/projects/${task.project.id}` : "/tasks"}
      />
    ) : null}
    </div>
  );
}
