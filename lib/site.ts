export function getSiteName() {
  const configured = process.env.NEXT_PUBLIC_SITE_NAME?.trim();
  return configured || "Society Project Hub";
}
