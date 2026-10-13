import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { createSessionValue, readSession } from "@/lib/admin/token";

const COOKIE = "edit_session";

export const hasEditAccess = cache(async () => {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!secret) {
    return false;
  }

  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;

  if (!value) {
    return false;
  }

  return readSession(value, secret, Date.now());
});

export async function setEditCookie() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!secret) {
    throw new Error("Edit session is not configured.");
  }

  const jar = await cookies();
  jar.set(COOKIE, createSessionValue(secret, Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearEditCookie() {
  const jar = await cookies();
  jar.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
