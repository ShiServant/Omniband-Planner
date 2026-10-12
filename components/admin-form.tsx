"use client";

import { useActionState } from "react";
import { enableEditMode } from "@/lib/actions/edit-mode";
import {
  Field,
  FormError,
  inputClass,
} from "@/components/form-fields";
import { Button } from "@/components/ui/button";

export function AdminForm({ returnTo }: { returnTo: string }) {
  const [state, action, pending] = useActionState(enableEditMode, null);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field label="Committee password">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <FormError message={state?.error} />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Enable editing"}
        </Button>
      </div>
    </form>
  );
}
