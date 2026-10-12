"use client";

import { useActionState, useState } from "react";
import { saveProject } from "@/lib/actions/projects";
import {
  Field,
  FormActions,
  FormError,
  inputClass,
  personOptionLabel,
  textareaClass,
} from "@/components/form-fields";
import {
  healthLabel,
  projectStatusLabel,
} from "@/lib/labels";
import type {
  PersonSummary,
  ProjectDetail,
  ProjectHealth,
  ProjectStatus,
} from "@/lib/types";

const statuses: ProjectStatus[] = [
  "planning",
  "in_progress",
  "completed",
  "archived",
];
const healths: ProjectHealth[] = ["on_track", "at_risk", "blocked"];

export function ProjectForm({
  project,
  people,
}: {
  project?: ProjectDetail;
  people: PersonSummary[];
}) {
  const [state, action, pending] = useActionState(saveProject, null);
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "planning",
  );
  const [health, setHealth] = useState<ProjectHealth>(
    project?.health ?? "on_track",
  );
  const [leadId, setLeadId] = useState(project?.lead.id ?? "");
  const [members, setMembers] = useState(
    () =>
      project?.members
        .filter((member) => member.id !== project.lead.id)
        .map((member) => ({ id: member.id, role: member.role })) ?? [],
  );
  const active = status === "planning" || status === "in_progress";
  const leadOptions = people.filter(
    (person) => person.active || person.id === project?.lead.id,
  );
  const memberOptions = people.filter(
    (person) =>
      person.id !== leadId &&
      (person.active || members.some((member) => member.id === person.id)),
  );

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-4">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={project?.name ?? ""}
          className={inputClass}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            name="status"
            value={status}
            onChange={(event) => {
              const next = event.target.value as ProjectStatus;
              setStatus(next);

              if (next === "planning" || next === "in_progress") {
                setHealth((current) => current || "on_track");
              }
            }}
            className={inputClass}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {projectStatusLabel(item)}
              </option>
            ))}
          </select>
        </Field>
        {active ? (
          <Field label="Health">
            <select
              name="health"
              value={health}
              onChange={(event) =>
                setHealth(event.target.value as ProjectHealth)
              }
              className={inputClass}
            >
              {healths.map((item) => (
                <option key={item} value={item}>
                  {healthLabel(item)}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <input type="hidden" name="health" value="" />
        )}
      </div>
      {!active ? (
        <p className="text-xs text-muted-foreground">
          Completed and archived projects leave the active list and have no
          health status.
        </p>
      ) : null}
      <Field label="Lead">
        <select
          name="leadPersonId"
          required
          value={leadId}
          onChange={(event) => {
            const next = event.target.value;
            setLeadId(next);
            setMembers((current) =>
              current.filter((member) => member.id !== next),
            );
          }}
          className={inputClass}
        >
          <option value="">Choose a lead</option>
          {leadOptions.map((person) => (
            <option key={person.id} value={person.id}>
              {personOptionLabel(person)}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date">
          <input
            name="startDate"
            type="date"
            defaultValue={project?.startDate ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Target date">
          <input
            name="dueDate"
            type="date"
            defaultValue={project?.dueDate ?? ""}
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        label="Progress"
        hint="Optional. Shown as a small percentage, not a progress bar."
      >
        <input
          name="progress"
          type="number"
          min={0}
          max={100}
          step={1}
          defaultValue={project?.progress ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          defaultValue={project?.description ?? ""}
          className={textareaClass}
        />
      </Field>
      <Field label="Objective">
        <textarea
          name="objective"
          defaultValue={project?.objective ?? ""}
          className={textareaClass}
        />
      </Field>
      <Field label="Current update">
        <textarea
          name="currentUpdate"
          defaultValue={project?.currentUpdate ?? ""}
          className={textareaClass}
        />
      </Field>
      <Field label="Next step">
        <textarea
          name="nextStep"
          defaultValue={project?.nextStep ?? ""}
          className={textareaClass}
        />
      </Field>
      <Field label="Next milestone">
        <input
          name="nextMilestone"
          defaultValue={project?.nextMilestone ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Blocker">
        <textarea
          name="blocker"
          defaultValue={project?.blocker ?? ""}
          className={textareaClass}
        />
      </Field>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Members</legend>
        <p className="text-xs text-muted-foreground">
          The lead is chosen above and is not listed again here.
        </p>
        {memberOptions.length > 0 ? (
          memberOptions.map((person) => {
            const selected = members.find((member) => member.id === person.id);

            return (
              <div key={person.id} className="flex flex-wrap items-center gap-3">
                <label className="flex min-w-48 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="memberId"
                    value={person.id}
                    checked={Boolean(selected)}
                    onChange={(event) => {
                      setMembers((current) =>
                        event.target.checked
                          ? [...current, { id: person.id, role: "Member" }]
                          : current.filter((member) => member.id !== person.id),
                      );
                    }}
                  />
                  {personOptionLabel(person)}
                </label>
                {selected ? (
                  <input
                    name={`memberRole-${person.id}`}
                    value={selected.role}
                    aria-label={`Role for ${person.name}`}
                    onChange={(event) => {
                      const role = event.target.value;
                      setMembers((current) =>
                        current.map((member) =>
                          member.id === person.id ? { ...member, role } : member,
                        ),
                      );
                    }}
                    className={`${inputClass} max-w-48`}
                  />
                ) : null}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No other active people.</p>
        )}
      </fieldset>
      <FormError message={state?.error} />
      <FormActions
        pending={pending}
        cancelHref={project ? `/projects/${project.id}` : "/projects"}
      />
    </form>
  );
}
