"use client";

import { deleteMeeting } from "@/lib/actions/meetings";
import { Button } from "@/components/ui/button";

export function DeleteMeetingButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form
      action={deleteMeeting}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${title}? Tasks from this meeting will stay.`,
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
