"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ActionState } from "@/lib/action-state";

export function useAutosave(
  save: (previous: ActionState, formData: FormData) => Promise<ActionState>,
  editPath: (id: string) => string,
) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const pathnameRef = useRef(pathname);
  const editPathRef = useRef(editPath);
  const timer = useRef<number>(undefined);
  const request = useRef(0);
  const creating = useRef(false);
  const followUp = useRef(false);
  const [phase, setPhase] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string>();

  pathnameRef.current = pathname;
  editPathRef.current = editPath;

  useEffect(() => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const blockSubmit = (event: Event) => event.preventDefault();
    form.addEventListener("submit", blockSubmit);

    return () => {
      form.removeEventListener("submit", blockSubmit);
      window.clearTimeout(timer.current);
      request.current += 1;
    };
  }, []);

  function schedule() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => runSave(false), 700);
  }

  function saveNow(event?: FormEvent) {
    event?.preventDefault();
    window.clearTimeout(timer.current);
    runSave(true);
  }

  function runSave(reportInvalid: boolean) {
    const form = formRef.current;

    if (!form) {
      return;
    }

    if (!form.checkValidity()) {
      if (reportInvalid) {
        form.reportValidity();
      }

      setPhase("idle");
      return;
    }

    const currentId = readId(form);

    if (!currentId && creating.current) {
      followUp.current = true;
      return;
    }

    if (!currentId) {
      creating.current = true;
    }

    const snapshot = serialize(form);
    const token = ++request.current;
    setPhase("saving");
    void save(null, new FormData(form))
      .then((result) => {
        if (token !== request.current) {
          return;
        }

        creating.current = false;

        if (result?.error) {
          setPhase("idle");
          setError(result.error);
          return;
        }

        setError(undefined);
        setPhase("saved");
        const latest = formRef.current;
        const changed = latest ? serialize(latest) !== snapshot : false;

        if (result?.id && result.id !== currentId && latest) {
          writeId(latest, result.id);
        }

        if (changed || followUp.current) {
          followUp.current = false;
          schedule();
          return;
        }

        if (!result?.id) {
          return;
        }

        const next = editPathRef.current(result.id);

        if (pathnameRef.current !== next) {
          router.replace(next);
        }
      })
      .catch(() => {
        if (token !== request.current) {
          return;
        }

        creating.current = false;
        setPhase("idle");
        setError("Could not save this record.");
      });
  }

  return { formRef, phase, error, schedule, saveNow };
}

function readId(form: HTMLFormElement) {
  const field = form.elements.namedItem("id");
  return field instanceof HTMLInputElement ? field.value : "";
}

function writeId(form: HTMLFormElement, id: string) {
  const field = form.elements.namedItem("id");

  if (field instanceof HTMLInputElement) {
    field.value = id;
    return;
  }

  const hidden = document.createElement("input");
  hidden.type = "hidden";
  hidden.name = "id";
  hidden.value = id;
  form.append(hidden);
}

function serialize(form: HTMLFormElement) {
  return [...new FormData(form).entries()]
    .map(([key, value]) => `${key}=${typeof value === "string" ? value : value.name}`)
    .join("&");
}
