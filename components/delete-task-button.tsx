"use client";

import { deleteTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";

export function DeleteTaskButton({
  id,
  title,
  returnTo,
}: {
  id: string;
  title: string;
  returnTo?: string;
}) {
  return (
    <form
      action={deleteTask}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${title}? This cannot be undone.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <Button type="submit" variant="destructive" size="sm">
        Delete
      </Button>
    </form>
  );
}
