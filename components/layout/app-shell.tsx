"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Users,
} from "lucide-react";
import { endEditMode } from "@/lib/actions/edit-mode";
import { cn } from "cn";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/meetings", label: "Meetings", icon: CalendarClock },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/people", label: "People", icon: Users },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md text-sm transition-transform active:scale-[0.98]",
              compact ? "px-2.5 py-1.5" : "px-3 py-2",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/80",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AppShell({
  siteName,
  editing,
  children,
}: {
  siteName: string;
  editing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden min-h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-6 py-5">
          <p className="text-sm font-semibold tracking-tight">{siteName}</p>
        </div>
        <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-3">
          <NavLinks />
        </nav>
        <div className="px-3 py-4">
          <EditEntry editing={editing} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm font-semibold tracking-tight">{siteName}</p>
            <EditEntry editing={editing} />
          </div>
          <nav aria-label="Primary" className="flex flex-wrap gap-1 px-3 pb-3">
            <NavLinks compact />
          </nav>
        </header>
        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

function EditEntry({ editing }: { editing: boolean }) {
  const pathname = usePathname() || "/";
  const returnTo = pathname.startsWith("/admin") ? "/" : pathname;

  if (editing) {
    return (
      <form action={endEditMode} className="flex items-center gap-3 px-3">
        <span className="text-xs text-muted-foreground">Editing</span>
        <button
          type="submit"
          className="cursor-pointer text-xs font-medium underline-offset-4 hover:underline"
        >
          Stop editing
        </button>
      </form>
    );
  }

  return (
    <Link
      href={`/admin?returnTo=${encodeURIComponent(returnTo)}`}
      className="px-3 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      Edit
    </Link>
  );
}
