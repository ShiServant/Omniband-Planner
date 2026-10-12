import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  v: number;
  exp: number;
};

export function passwordsMatch(submitted: string, expected: string) {
  const left = createHash("sha256").update(submitted, "utf8").digest();
  const right = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(left, right);
}

export function createSessionValue(secret: string, now: number) {
  const payload = Buffer.from(
    JSON.stringify({
      v: 1,
      exp: now + SESSION_MAX_AGE_SECONDS * 1000,
    } satisfies SessionPayload),
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function readSession(value: string, secret: string, now: number) {
  const parts = value.split(".");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }

  const [payload, signature] = parts;
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  if (!signaturesMatch(signature, expected)) {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;

    return data.v === 1 && typeof data.exp === "number" && data.exp > now;
  } catch {
    return false;
  }
}

export function safeReturnTo(value: string) {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("://") ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    /%2f|%5c/i.test(value)
  ) {
    return "/";
  }

  return value;
}

function signaturesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
