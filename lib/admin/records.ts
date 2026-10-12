import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { SaveError, throwDb } from "@/lib/supabase/admin";

export async function assertPeople(
  db: SupabaseClient,
  ids: string[],
  allowedInactive: Set<string>,
) {
  const unique = [...new Set(ids)];

  if (unique.length === 0) {
    return;
  }

  const { data, error } = await db
    .from("people")
    .select("id, active")
    .in("id", unique);

  if (error) {
    throwDb(error);
  }

  const people = (data ?? []) as Array<{ id: string; active: boolean }>;

  if (people.length !== unique.length) {
    throw new SaveError("Choose a person from the list.");
  }

  for (const person of people) {
    if (!person.active && !allowedInactive.has(person.id)) {
      throw new SaveError("Choose an active person.");
    }
  }
}

export async function assertProjects(db: SupabaseClient, ids: string[]) {
  const unique = [...new Set(ids)];

  if (unique.length === 0) {
    return;
  }

  const { data, error } = await db.from("projects").select("id").in("id", unique);

  if (error) {
    throwDb(error);
  }

  if ((data ?? []).length !== unique.length) {
    throw new SaveError("Choose a project from the list.");
  }
}
