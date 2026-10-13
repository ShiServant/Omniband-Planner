"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enableEditMode } from "@/lib/actions/edit-mode";
import { rememberEntry } from "@/lib/entry";
import { Field, FormError, inputClass } from "@/components/form-fields";
import { Button } from "@/components/ui/button";

export function AdminForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex max-w-sm flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setPending(true);
        setError(undefined);
        void enableEditMode(null, formData).then((result) => {
          if (result?.error) {
            setPending(false);
            setError(result.error);
            return;
          }

          rememberEntry();
          router.push(returnTo);
          router.refresh();
        });
      }}
    >
      <Field label="Committee password">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <FormError message={error} />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Enable editing"}
        </Button>
      </div>
    </form>
  );
}
