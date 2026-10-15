"use client";

import { savePerson } from "@/lib/actions/people";
import {
  Field,
  SaveStatus,
  inputClass,
  textareaClass,
} from "@/components/form-fields";
import { useAutosave } from "@/components/use-autosave";
import type { PersonSummary } from "@/lib/types";

export function PersonForm({ person }: { person?: PersonSummary }) {
  const { formRef, phase, error, schedule } = useAutosave(
    savePerson,
    (id) => `/people/${id}/edit`,
  );

  return (
    <form
      ref={formRef}
      className="flex max-w-xl flex-col gap-4"
      onInput={schedule}
      onChange={schedule}
    >
      {person ? <input type="hidden" name="id" value={person.id} /> : null}
      <Field label="Name">
        <input
          name="name"
          required
          defaultValue={person?.name ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Email">
        <input
          name="email"
          type="email"
          defaultValue={person?.email ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Contact">
        <textarea
          name="contactInfo"
          defaultValue={person?.contactInfo ?? ""}
          className={textareaClass}
        />
      </Field>
      <Field label="Avatar URL" hint="Optional. Paste an image address.">
        <input
          name="avatarUrl"
          type="url"
          defaultValue={person?.avatarUrl ?? ""}
          className={inputClass}
        />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={person?.active ?? true}
          className="mt-0.5"
        />
        <span>
          Active
          <span className="mt-1 block text-xs text-muted-foreground">
            Inactive people stay on past records and are not offered for new
            responsibilities.
          </span>
        </span>
      </label>
      <SaveStatus phase={phase} error={error} />
    </form>
  );
}
