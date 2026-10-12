import { cn } from "cn";
import {
  healthLabel,
  priorityLabel,
  projectStatusLabel,
  taskStatusLabel,
} from "@/lib/labels";
import type {
  ProjectHealth,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";

type Tone = "neutral" | "good" | "warning" | "bad" | "muted";

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-foreground",
  good: "bg-emerald-50 text-emerald-950",
  warning: "bg-amber-50 text-amber-950",
  bad: "bg-red-50 text-red-950",
  muted: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const tone =
    status === "completed" ? "good" : status === "archived" ? "muted" : "neutral";

  return <StatusBadge tone={tone}>{projectStatusLabel(status)}</StatusBadge>;
}

export function HealthBadge({ health }: { health: ProjectHealth }) {
  const tone =
    health === "on_track" ? "good" : health === "at_risk" ? "warning" : "bad";

  return <StatusBadge tone={tone}>{healthLabel(health)}</StatusBadge>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const tone =
    status === "done" ? "muted" : status === "blocked" ? "bad" : "neutral";

  return <StatusBadge tone={tone}>{taskStatusLabel(status)}</StatusBadge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const tone =
    priority === "urgent" ? "bad" : priority === "high" ? "warning" : "muted";

  return <StatusBadge tone={tone}>{priorityLabel(priority)}</StatusBadge>;
}
