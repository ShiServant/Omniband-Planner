"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { clearEditCookie, setEditCookie } from "@/lib/admin/session";
import { passwordsMatch } from "@/lib/admin/token";
import { field } from "@/lib/forms";

export async function enableEditMode(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = field(formData, "password");
  const expected = process.env.ADMIN_PASSWORD?.trim() ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
  const configured = expected.length > 0 && secret.length > 0;
  const matches = passwordsMatch(password, expected || " ");

  if (!configured || !matches) {
    return { error: "Could not enable editing." };
  }

  await setEditCookie();
  revalidatePath("/", "layout");
  return null;
}

export async function continueAsReadOnly() {
  await clearEditCookie();
  revalidatePath("/", "layout");
}

export async function endEditMode() {
  await clearEditCookie();
  revalidatePath("/", "layout");
  redirect("/");
}
