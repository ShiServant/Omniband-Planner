"use client";

import { useState } from "react";
import { saveProject } from "@/lib/actions/projects";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { Button } from "@/components/ui/button";
import {
  Field,
  SaveStatus,
  inputClass,
  personOptionLabel,
  textareaClass,
} from "@/components/form-fields";
import { useAutosave } from "@/components/use-autosave";
import { projectStatusLabel } from "@/lib/labels";
import type { PersonSummary, ProjectDetail, ProjectStatus } from "@/lib/types";

const statuses: ProjectStatus[] = [
  "planning",
  "in_progress",
  "completed",
  "archived",
];

export function ProjectForm({
  project,
  people,
}: {
  project?: ProjectDetail;
  people: PersonSummary[];
}) {
  const { formRef, phase, error, schedule, saveNow } = useAutosave(
    saveProject,
    (id) => `/projects/${id}/edit`,
  );
  const [status, setStatus] = useState<ProjectStatus>(
    project?.status ?? "planning",
  );
  const [leadId, setLeadId] = useState(project?.lead.id ?? "");
  const [members, setMembers] = useState(
    () =>
      project?.members
        .filter((member) => member.id !== project.lead.id)
        .map((member) => ({ id: member.id, role: member.role })) ?? [],
  );
  const leadOptions = people.filter(
    (person) => person.active || person.id === project?.lead.id,
  );
  const memberOptions = people.filter(
    (person) =>
      person.id !== leadId &&
      (person.active || members.some((member) => member.id === person.id)),
  );

  return (
    <div className="flex max-w-2xl flex-col gap-8">
    <form
      ref={formRef}
      className="flex flex-col gap-4"
      onInput={schedule}
      onChange={schedule}
      onSubmit={saveNow}
    >
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={project?.name ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Status">
        <select
          name="status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ProjectStatus);
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
      <Field label="Description">
        <textarea
          name="description"
          defaultValue={project?.description ?? ""}
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
      {project ? null : (
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={phase === "saving"}>
            {phase === "saving" ? "Saving…" : "Apply"}
          </Button>
        </div>
      )}
      <SaveStatus phase={phase} error={error} />
    </form>
    {project ? <DeleteProjectButton id={project.id} name={project.name} /> : null}
    </div>
  );
}
