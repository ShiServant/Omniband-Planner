"use client";

import { useState } from "react";
import { RecordFiles, useRecordFiles } from "@/components/record-files";
import { Button } from "@/components/ui/button";
import { saveMeeting } from "@/lib/actions/meetings";
import {
  Field,
  SaveStatus,
  inputClass,
  textareaClass,
} from "@/components/form-fields";
import { useAutosave } from "@/components/use-autosave";
import type { ActionState } from "@/lib/action-state";
import type { MeetingDetail, ProjectSummary } from "@/lib/types";

export function MeetingForm({
  meeting,
  meetingLocal,
  projects,
}: {
  meeting?: MeetingDetail;
  meetingLocal: string;
  projects: ProjectSummary[];
}) {
  const files = useRecordFiles();
  const { formRef, phase, error, schedule, saveNow } = useAutosave(
    async (previous: ActionState, formData: FormData) => {
      const taken = files.take(formData);
      const result = await saveMeeting(previous, formData);

      if (result?.error) {
        files.restore(taken);
        return result;
      }

      files.clear();
      return result;
    },
    (id) => `/meetings/${id}/edit`,
  );
  const [projectIds, setProjectIds] = useState(
    () => meeting?.projects.map((project) => project.id) ?? [],
  );
  return (
    <form
      ref={formRef}
      className="flex max-w-3xl flex-col gap-8"
      onInput={schedule}
      onChange={schedule}
      onSubmit={saveNow}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest("button")) {
          schedule();
        }
      }}
    >
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
      </section>

      <RecordFiles
        files={meeting?.files ?? []}
        recordId={meeting?.id}
        downloadPath={(id, fileId) => `/meetings/${id}/files/${fileId}`}
        pending={files}
        onChange={schedule}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={phase === "saving"}>
          {phase === "saving" ? "Saving…" : "Apply"}
        </Button>
      </div>
      <SaveStatus phase={phase} error={error} />
    </form>
  );
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
