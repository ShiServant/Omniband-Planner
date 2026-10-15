"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { emptyToNull, field, firstIssue } from "@/lib/forms";
import { isUuid } from "@/lib/format";
import { SaveError, messageFrom, throwDb, withAdminDb } from "@/lib/supabase/admin";
import { personSchema } from "@/lib/validators";

export async function savePerson(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = field(formData, "id");

  if (id && !isUuid(id)) {
    return { error: "This record could not be found." };
  }

  const parsed = personSchema.safeParse({
    name: field(formData, "name"),
    email: field(formData, "email"),
    contactInfo: field(formData, "contactInfo"),
    avatarUrl: field(formData, "avatarUrl"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const payload = {
    name: parsed.data.name,
    society_role: null,
    email: emptyToNull(parsed.data.email),
    contact_info: emptyToNull(parsed.data.contactInfo),
    avatar_url: emptyToNull(parsed.data.avatarUrl),
    active: parsed.data.active,
  };

  let savedId = id;

  try {
    savedId = await withAdminDb(async (db) => {
      if (id) {
        const { data, error } = await db
          .from("people")
          .update(payload)
          .eq("id", id)
          .select("id")
          .maybeSingle();

        if (error) {
          throwDb(error);
        }

        if (!data) {
          throw new SaveError("This record could not be found.");
        }

        return id;
      }

      const { data, error } = await db
        .from("people")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        throwDb(error);
      }

      return String(data.id);
    });
  } catch (error) {
    return { error: messageFrom(error) };
  }

  revalidatePath("/", "layout");
  return { id: savedId };
}
