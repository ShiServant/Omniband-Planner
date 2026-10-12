export function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

export function fields(formData: FormData, name: string) {
  return formData.getAll(name).map((value) => String(value));
}

export function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function firstIssue(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message ?? "Check the form.";
}
