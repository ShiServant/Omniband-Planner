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
              "flex items-center gap-2 rounded-md text-sm",
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
  children,
}: {
  siteName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-6 py-5">
          <p className="text-sm font-semibold tracking-tight">{siteName}</p>
        </div>
        <nav aria-label="Primary" className="flex flex-col gap-1 px-3">
          <NavLinks />
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold tracking-tight">{siteName}</p>
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
