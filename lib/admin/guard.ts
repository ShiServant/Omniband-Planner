import "server-only";

import { redirect } from "next/navigation";
import { hasEditAccess } from "@/lib/admin/session";
import { safeReturnTo } from "@/lib/admin/token";

export async function requireEditPage(returnTo: string) {
  if (!(await hasEditAccess())) {
    redirect(`/admin?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
  }
}
