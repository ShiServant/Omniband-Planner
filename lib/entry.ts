export const ENTRY_KEY = "planner-entered";

export function rememberEntry() {
  sessionStorage.setItem(ENTRY_KEY, "1");
  document.documentElement.setAttribute("data-entered", "1");
  document.getElementById("app")?.removeAttribute("inert");
}

export function viewingPath(pathname: string) {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return "/";
  }

  if (pathname.endsWith("/new")) {
    const parent = pathname.slice(0, -"/new".length);
    return parent.length > 0 ? parent : "/";
  }

  if (pathname.startsWith("/tasks/") && pathname.endsWith("/edit")) {
    return "/tasks";
  }

  if (pathname.endsWith("/edit")) {
    const parent = pathname.slice(0, -"/edit".length);
    return parent.length > 0 ? parent : "/";
  }

  return pathname || "/";
}
