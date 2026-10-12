import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasEditAccess } from "@/lib/admin/session";

type DbError = {
  code?: string;
  message?: string;
  details?: string | null;
};

export class EditAccessError extends Error {
  constructor() {
    super("Edit access is required.");
    this.name = "EditAccessError";
  }
}

export class SaveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SaveError";
  }
}

export async function withAdminDb<T>(
  fn: (db: SupabaseClient) => Promise<T>,
): Promise<T> {
  if (!(await hasEditAccess())) {
    throw new EditAccessError();
  }

  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !key) {
    throw new SaveError("Editing is not configured.");
  }

  const db = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });

  return fn(db);
}

export function throwDb(error: DbError): never {
  const text = `${error.message ?? ""} ${error.details ?? ""}`;

  if (error.code === "23505" && text.toLowerCase().includes("email")) {
    throw new SaveError("That email is already used.");
  }

  if (error.code === "23505") {
    throw new SaveError("That value is already used.");
  }

  if (error.code === "23503") {
    throw new SaveError("This record is still linked to something else.");
  }

  if (error.code === "23514") {
    throw new SaveError("Check the form and try again.");
  }

  console.error(error);
  throw new SaveError("Could not save this record.");
}

export function messageFrom(error: unknown) {
  if (error instanceof SaveError || error instanceof EditAccessError) {
    return error.message;
  }

  console.error(error);
  return "Could not save this record.";
}
