import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export const textareaClass =
  "min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function FormActions({
  pending,
  cancelHref,
}: {
  pending: boolean;
  cancelHref: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      <Link
        href={cancelHref}
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Cancel
      </Link>
    </div>
  );
}

export function personOptionLabel(person: {
  name: string;
  societyRole: string | null;
  active: boolean;
}) {
  const role = person.societyRole ? ` — ${person.societyRole}` : "";
  return person.active ? `${person.name}${role}` : `${person.name}${role} (inactive)`;
}
