import "server-only";

import { buildDashboard } from "@/lib/dashboard";
import { listProjects } from "@/lib/data/projects";
import type { DataResult } from "@/lib/data/read";
import { listTasks } from "@/lib/data/tasks";
import { londonToday } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

export async function getDashboard(): Promise<DataResult<DashboardData>> {
  const [projects, tasks] = await Promise.all([
    listProjects("all"),
    listTasks({ status: "in_progress" }),
  ]);

  if (!projects.configured || !tasks.configured) {
    return { configured: false };
  }

  return {
    configured: true,
    data: buildDashboard(projects.data, tasks.data, londonToday()),
  };
}
