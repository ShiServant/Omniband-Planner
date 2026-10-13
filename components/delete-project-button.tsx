"use client";

import { deleteProject } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";

export function DeleteProjectButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <form
      action={deleteProject}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${name}? Its tasks will be removed.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive" size="sm">
        Delete
      </Button>
    </form>
  );
}
