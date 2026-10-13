import { addDays } from "@/lib/format";
import type {
  DashboardData,
  DecisionSummary,
  ProjectSummary,
  TaskPriority,
  TaskSummary,
  UpcomingItem,
} from "@/lib/types";

const UPCOMING_DAYS = 14;
const IMPORTANT_DUE_DAYS = 7;
const IMPORTANT_TASK_LIMIT = 8;
const RECENT_LIMIT = 5;

const priorityRank: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function isActive(project: ProjectSummary) {
  return project.status === "planning" || project.status === "in_progress";
}

function byDueDateThenName(a: ProjectSummary, b: ProjectSummary) {
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
    return a.dueDate < b.dueDate ? -1 : 1;
  }

  if (a.dueDate && !b.dueDate) {
    return -1;
  }

  if (!a.dueDate && b.dueDate) {
    return 1;
  }

  return a.name.localeCompare(b.name, "en");
}

function byDueDateThenPriority(a: TaskSummary, b: TaskSummary) {
  if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
    return a.dueDate < b.dueDate ? -1 : 1;
  }

  if (a.dueDate && !b.dueDate) {
    return -1;
  }

  if (!a.dueDate && b.dueDate) {
    return 1;
  }

  return priorityRank[a.priority] - priorityRank[b.priority];
}

export function buildDashboard(
  projects: ProjectSummary[],
  tasks: TaskSummary[],
  decisions: DecisionSummary[],
  today: string,
): DashboardData {
  const activeProjects = projects.filter(isActive).sort(byDueDateThenName);
  const upcomingHorizon = addDays(today, UPCOMING_DAYS);
  const importantHorizon = addDays(today, IMPORTANT_DUE_DAYS);

  const attentionProjects = activeProjects
    .filter(
      (project) => project.health === "blocked" || project.health === "at_risk",
    )
    .sort((a, b) => {
      if (a.health !== b.health) {
        return a.health === "blocked" ? -1 : 1;
      }

      return byDueDateThenName(a, b);
    });

  const upcoming: UpcomingItem[] = [
    ...activeProjects.flatMap((project) => {
      if (!project.dueDate || project.dueDate > upcomingHorizon) {
        return [];
      }

      return [
        {
          id: `project-${project.id}`,
          projectId: project.id,
          title: project.nextMilestone ?? project.name,
          detail: project.nextMilestone
            ? `${project.name} · Lead ${project.lead.name}`
            : `Lead ${project.lead.name}`,
          dueDate: project.dueDate,
          overdue: project.dueDate < today,
        },
      ];
    }),
    ...tasks.flatMap((task) => {
      if (!task.dueDate || task.dueDate > upcomingHorizon) {
        return [];
      }

      return [
        {
          id: `task-${task.id}`,
          projectId: task.project.id,
          taskId: task.id,
          title: task.title,
          detail: `${task.responsible.name} · ${task.project.name}`,
          dueDate: task.dueDate,
          overdue: task.dueDate < today,
        },
      ];
    }),
  ].sort((a, b) => {
    if (a.dueDate !== b.dueDate) {
      return a.dueDate < b.dueDate ? -1 : 1;
    }

    return a.title.localeCompare(b.title, "en");
  });

  const importantTasks = tasks
    .filter(
      (task) =>
        task.priority === "high" ||
        task.priority === "urgent" ||
        (task.dueDate !== null && task.dueDate <= importantHorizon),
    )
    .sort(byDueDateThenPriority)
    .slice(0, IMPORTANT_TASK_LIMIT);

  const recentDecisions = [...decisions]
    .sort((a, b) => {
      if (a.meeting.meetingDate !== b.meeting.meetingDate) {
        return a.meeting.meetingDate < b.meeting.meetingDate ? 1 : -1;
      }

      return a.createdAt < b.createdAt ? -1 : 1;
    })
    .slice(0, RECENT_LIMIT);

  const recentProjects = [...projects]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, RECENT_LIMIT);

  return {
    counts: {
      active: activeProjects.length,
      onTrack: activeProjects.filter((project) => project.health === "on_track")
        .length,
      needsAttention: activeProjects.filter(
        (project) => project.health === "at_risk",
      ).length,
      blocked: activeProjects.filter((project) => project.health === "blocked")
        .length,
    },
    activeProjects,
    attentionProjects,
    upcoming,
    importantTasks,
    recentDecisions,
    recentProjects,
  };
}
