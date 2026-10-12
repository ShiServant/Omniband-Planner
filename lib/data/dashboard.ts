import "server-only";

import { buildDashboard } from "@/lib/dashboard";
import { listDecisions } from "@/lib/data/meetings";
import { listProjects } from "@/lib/data/projects";
import type { DataResult } from "@/lib/data/read";
import { listTasks } from "@/lib/data/tasks";
import { londonToday } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

export async function getDashboard(): Promise<DataResult<DashboardData>> {
  const [projects, tasks, decisions] = await Promise.all([
    listProjects("all"),
    listTasks({ status: "outstanding" }),
    listDecisions(),
  ]);

  if (
    !projects.configured ||
    !tasks.configured ||
    !decisions.configured
  ) {
    return { configured: false };
  }

  return {
    configured: true,
    data: buildDashboard(
      projects.data,
      tasks.data,
      decisions.data,
      londonToday(),
    ),
  };
}
