"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { saveMeeting } from "@/lib/actions/meetings";
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
  MeetingDetail,
  PersonSummary,
  ProjectSummary,
  TaskPriority,
  TaskStatus,
  TaskSummary,
} from "@/lib/types";

const statuses: TaskStatus[] = ["to_do", "in_progress", "blocked", "done"];
const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

type DecisionRow = {
  key: string;
  id: string;
  content: string;
  projectId: string;
};

type ActionRow = {
  key: string;
  id: string;
  title: string;
  description: string;
  responsibleId: string;
  projectId: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
};

export function MeetingForm({
  meeting,
  meetingLocal,
  people,
  projects,
  tasks,
}: {
  meeting?: MeetingDetail;
  meetingLocal: string;
  people: PersonSummary[];
  projects: ProjectSummary[];
  tasks: TaskSummary[];
}) {
  const [state, action, pending] = useActionState(saveMeeting, null);
  const [attendeeIds, setAttendeeIds] = useState(
    () => meeting?.attendees.map((person) => person.id) ?? [],
  );
  const [projectIds, setProjectIds] = useState(
    () => meeting?.projects.map((project) => project.id) ?? [],
  );
  const [decisions, setDecisions] = useState<DecisionRow[]>(
    () =>
      meeting?.decisions.map((decision) => ({
        key: decision.id,
        id: decision.id,
        content: decision.content,
        projectId: decision.project?.id ?? "",
      })) ?? [],
  );
  const [actions, setActions] = useState<ActionRow[]>(
    () =>
      meeting?.tasks.map((task) => ({
        key: task.id,
        id: task.id,
        title: task.title,
        description: task.description ?? "",
        responsibleId: task.responsible.id,
        projectId: task.project.id,
        dueDate: task.dueDate ?? "",
        status: task.status,
        priority: task.priority,
      })) ?? [],
  );
  const usedTaskIds = new Set(actions.map((row) => row.id).filter(Boolean));
  const attachable = tasks.filter((task) => !usedTaskIds.has(task.id));
  const attendeeOptions = people.filter(
    (person) => person.active || attendeeIds.includes(person.id),
  );

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-8">
      {meeting ? <input type="hidden" name="id" value={meeting.id} /> : null}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Overview</h2>
        <Field label="Title">
          <input
            name="title"
            required
            defaultValue={meeting?.title ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Date and time" hint="Europe/London.">
          <input
            name="meetingLocal"
            type="datetime-local"
            required
            defaultValue={meetingLocal}
            className={inputClass}
          />
        </Field>
        <CheckboxGroup
          legend="Attendees"
          empty="No active people to add."
          options={attendeeOptions.map((person) => ({
            id: person.id,
            label: personOptionLabel(person),
          }))}
          selected={attendeeIds}
          name="attendeeId"
          onChange={setAttendeeIds}
        />
        <CheckboxGroup
          legend="Projects discussed"
          empty="No projects yet."
          options={projects.map((project) => ({
            id: project.id,
            label: project.name,
          }))}
          selected={projectIds}
          name="projectId"
          onChange={setProjectIds}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Summary</h2>
        <Field label="Summary">
          <textarea
            name="summary"
            defaultValue={meeting?.summary ?? ""}
            className={textareaClass}
          />
        </Field>
        <Field label="Discussion notes">
          <textarea
            name="discussionNotes"
            defaultValue={meeting?.discussionNotes ?? ""}
            className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <div>
          <h2 className="text-base font-semibold">Decisions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What was agreed. Removing a decision deletes it.
          </p>
        </div>
        {decisions.map((decision, index) => (
          <div key={decision.key} className="flex flex-col gap-3 rounded-md bg-muted/40 p-3">
            <input type="hidden" name="decisionId" value={decision.id} />
            <Field label={`Decision ${index + 1}`}>
              <textarea
                name="decisionContent"
                required
                value={decision.content}
                onChange={(event) =>
                  updateDecision(decision.key, { content: event.target.value })
                }
                className={textareaClass}
              />
            </Field>
            <Field label="Project" hint="Optional.">
              <select
                name="decisionProjectId"
                value={decision.projectId}
                onChange={(event) =>
                  updateDecision(decision.key, { projectId: event.target.value })
                }
                className={inputClass}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDecisions((current) =>
                    current.filter((row) => row.key !== decision.key),
                  )
                }
              >
                Remove decision
              </Button>
            </div>
          </div>
        ))}
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setDecisions((current) => [
                ...current,
                {
                  key: crypto.randomUUID(),
                  id: "",
                  content: "",
                  projectId: "",
                },
              ])
            }
          >
            Add decision
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border p-4">
        <div>
          <h2 className="text-base font-semibold">Action items</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each action item is a task. Removing one from this meeting keeps
            the task and clears where it came from.
          </p>
        </div>
        {actions.map((row, index) => {
          const responsibleOptions = people.filter(
            (person) => person.active || person.id === row.responsibleId,
          );

          return (
            <div key={row.key} className="flex flex-col gap-3 rounded-md bg-muted/40 p-3">
              <input type="hidden" name="actionId" value={row.id} />
              <Field label={`Action ${index + 1}`}>
                <input
                  name="actionTitle"
                  required
                  value={row.title}
                  onChange={(event) =>
                    updateAction(row.key, { title: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Details">
                <textarea
                  name="actionDescription"
                  value={row.description}
                  onChange={(event) =>
                    updateAction(row.key, { description: event.target.value })
                  }
                  className={textareaClass}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Responsible">
                  <select
                    name="actionResponsibleId"
                    required
                    value={row.responsibleId}
                    onChange={(event) =>
                      updateAction(row.key, {
                        responsibleId: event.target.value,
                      })
                    }
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
                <Field label="Project">
                  <select
                    name="actionProjectId"
                    required
                    value={row.projectId}
                    onChange={(event) =>
                      updateAction(row.key, { projectId: event.target.value })
                    }
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
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Due">
                  <input
                    name="actionDue"
                    type="date"
                    value={row.dueDate}
                    onChange={(event) =>
                      updateAction(row.key, { dueDate: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Status">
                  <select
                    name="actionStatus"
                    value={row.status}
                    onChange={(event) =>
                      updateAction(row.key, {
                        status: event.target.value as TaskStatus,
                      })
                    }
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
                    name="actionPriority"
                    value={row.priority}
                    onChange={(event) =>
                      updateAction(row.key, {
                        priority: event.target.value as TaskPriority,
                      })
                    }
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
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setActions((current) =>
                      current.filter((item) => item.key !== row.key),
                    )
                  }
                >
                  Remove from meeting
                </Button>
              </div>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setActions((current) => [
                ...current,
                {
                  key: crypto.randomUUID(),
                  id: "",
                  title: "",
                  description: "",
                  responsibleId: "",
                  projectId: projectIds[0] ?? "",
                  dueDate: "",
                  status: "to_do",
                  priority: "medium",
                },
              ])
            }
          >
            Add action item
          </Button>
          {attachable.length > 0 ? (
            <select
              aria-label="Attach an existing task"
              value=""
              onChange={(event) => {
                const task = tasks.find((item) => item.id === event.target.value);

                if (!task) {
                  return;
                }

                setActions((current) => [
                  ...current,
                  {
                    key: task.id,
                    id: task.id,
                    title: task.title,
                    description: task.description ?? "",
                    responsibleId: task.responsible.id,
                    projectId: task.project.id,
                    dueDate: task.dueDate ?? "",
                    status: task.status,
                    priority: task.priority,
                  },
                ]);
              }}
              className={`${inputClass} max-w-sm`}
            >
              <option value="">Attach an existing task</option>
              {attachable.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} — {task.project.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </section>

      <FormError message={state?.error} />
      <FormActions
        pending={pending}
        cancelHref={meeting ? `/meetings/${meeting.id}` : "/meetings"}
      />
    </form>
  );

  function updateDecision(key: string, patch: Partial<DecisionRow>) {
    setDecisions((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function updateAction(key: string, patch: Partial<ActionRow>) {
    setActions((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }
}

function CheckboxGroup({
  legend,
  empty,
  options,
  selected,
  name,
  onChange,
}: {
  legend: string;
  empty: string;
  options: Array<{ id: string; label: string }>;
  selected: string[];
  name: string;
  onChange: (ids: string[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      {options.length > 0 ? (
        options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={name}
              value={option.id}
              checked={selected.includes(option.id)}
              onChange={(event) => {
                onChange(
                  event.target.checked
                    ? [...selected, option.id]
                    : selected.filter((id) => id !== option.id),
                );
              }}
            />
            {option.label}
          </label>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </fieldset>
  );
}
