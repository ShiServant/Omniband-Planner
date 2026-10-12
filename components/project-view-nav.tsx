import Link from "next/link";
import { cn } from "cn";
import type { ProjectView } from "@/lib/data/projects";

const views: Array<{ id: Exclude<ProjectView, "all">; label: string; href: string }> =
  [
    { id: "active", label: "Active", href: "/projects" },
    { id: "completed", label: "Completed", href: "/projects?view=completed" },
    { id: "archived", label: "Archived", href: "/projects?view=archived" },
  ];

export function ProjectViewNav({
  view,
}: {
  view: Exclude<ProjectView, "all">;
}) {
  return (
    <nav aria-label="Project status" className="mb-6 flex gap-4 border-b">
      {views.map((item) => {
        const current = item.id === view;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-1 pb-2 text-sm",
              current
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
