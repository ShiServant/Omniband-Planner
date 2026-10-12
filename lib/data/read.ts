import "server-only";

export type DataResult<T> =
  | { configured: false }
  | { configured: true; data: T };

export function failRead(label: string, message: string): never {
  console.error(`Could not load ${label}: ${message}`);
  throw new Error(`Could not load ${label}.`);
}

export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
