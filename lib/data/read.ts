import "server-only";

export type DataResult<T> =
  | { configured: false }
  | { configured: true; data: T };

export function failRead(label: string, message: string): never {
  console.error(`Could not load ${label}: ${readErrorText(message)}`);
  throw new Error(`Could not load ${label}.`);
}

function readErrorText(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();

  if (/<!doctype|<html|error code 522|connection timed out/i.test(compact)) {
    return "The database did not respond. Try again in a moment.";
  }

  return compact.slice(0, 240);
}

export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
