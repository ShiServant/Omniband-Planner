"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  continueAsReadOnly,
  enableEditMode,
} from "@/lib/actions/edit-mode";
import { ENTRY_KEY, rememberEntry, viewingPath } from "@/lib/entry";
import { Field, FormError, inputClass } from "@/components/form-fields";

function subscribe() {
  return () => {};
}

function hasEntered() {
  return sessionStorage.getItem(ENTRY_KEY) === "1";
}

export function EntryGate({ siteName }: { siteName: string }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const stored = useSyncExternalStore(subscribe, hasEntered, () => false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState<"edit" | "view" | null>(null);
  const visible = !stored && !dismissed;

  useEffect(() => {
    const app = document.getElementById("app");

    if (!visible) {
      app?.removeAttribute("inert");
      return;
    }

    app?.setAttribute("inert", "");
    return () => app?.removeAttribute("inert");
  }, [visible]);

  if (!visible) {
    return null;
  }

  function finish(nextPath?: string) {
    rememberEntry();
    setDismissed(true);

    if (nextPath && nextPath !== pathname) {
      router.push(nextPath);
      return;
    }

    router.refresh();
  }

  return (
    <div className="entry-gate fixed inset-0 z-50 flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{siteName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the committee password to edit records, or view them without
          making changes.
        </p>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            setPending("edit");
            setError(undefined);
            void enableEditMode(null, formData)
              .then((result) => {
                if (result?.error) {
                  setPending(null);
                  setError(result.error);
                  return;
                }

                finish();
              })
              .catch(() => {
                setPending(null);
                setError("Could not enable editing.");
              });
          }}
        >
          <Field label="Committee password">
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              className={inputClass}
            />
          </Field>
          <FormError message={error} />
          <Button type="submit" disabled={pending !== null}>
            {pending === "edit" ? "Checking…" : "Edit records"}
          </Button>
        </form>
        <form
          className="mt-3"
          onSubmit={(event) => {
            event.preventDefault();
            setPending("view");
            setError(undefined);
            void continueAsReadOnly()
              .then(() => {
                finish(viewingPath(pathname));
              })
              .catch(() => {
                setPending(null);
                setError("Could not open the records.");
              });
          }}
        >
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={pending !== null}
          >
            {pending === "view" ? "Opening…" : "View only"}
          </Button>
        </form>
      </div>
    </div>
  );
}
