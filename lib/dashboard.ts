import { addDays } from "@/lib/format";
import type {
  CalendarEntry,
  DashboardData,
  ProjectSummary,
  TaskSummary,
  UpcomingItem,
} from "@/lib/types";

const UPCOMING_DAYS = 14;

function projectPeople(project: ProjectSummary) {
  if (project.includeEveryone) {
    return "Everyone";
  }

  const names = project.members.map((member) => member.name);
  return names.length > 0 ? names.join(", ") : "No members";
}

function taskPeople(task: TaskSummary) {
  const names = task.responsibles.map((person) => person.name);
  return names.length > 0 ? names.join(", ") : "No one";
}

function isActive(project: ProjectSummary) {
  return project.status === "planning" || project.status === "in_progress";
}

export function buildDashboard(
  projects: ProjectSummary[],
  tasks: TaskSummary[],
  today: string,
): DashboardData {
  const activeProjects = projects
    .filter(isActive)
    .sort((a, b) => {
      if (a.createdAt !== b.createdAt) {
        return a.createdAt < b.createdAt ? 1 : -1;
      }

      return a.name.localeCompare(b.name, "en");
    });
  const upcomingHorizon = addDays(today, UPCOMING_DAYS);
  const openTasks = tasks.filter((task) => task.status !== "done");

  const upcoming: UpcomingItem[] = [
    ...activeProjects.flatMap((project) => {
      if (!project.dueDate || project.dueDate > upcomingHorizon) {
        return [];
      }

      return [
        {
          id: `project-${project.id}`,
          projectId: project.id,
          title: project.name,
          detail: projectPeople(project),
          dueDate: project.dueDate,
          overdue: project.dueDate < today,
        },
      ];
    }),
    ...openTasks.flatMap((task) => {
      if (!task.dueDate || task.dueDate > upcomingHorizon) {
        return [];
      }

      return [
        {
          id: `task-${task.id}`,
          projectId: task.project.id,
          taskId: task.id,
          title: task.title,
          detail: `${taskPeople(task)} · ${task.project.name}`,
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

  const calendar: CalendarEntry[] = [
    ...activeProjects.flatMap((project) => {
      if (!project.dueDate) {
        return [];
      }

      return [
        {
          date: project.dueDate,
          kind: "project" as const,
          title: project.name,
          detail: projectPeople(project),
        },
      ];
    }),
    ...openTasks.flatMap((task) => {
      if (!task.dueDate) {
        return [];
      }

      return [
        {
          date: task.dueDate,
          kind: "deadline" as const,
          title: task.title,
          detail: `${taskPeople(task)} · ${task.project.name}`,
        },
      ];
    }),
  ];

  return {
    today,
    activeProjects,
    upcoming,
    tasks: openTasks,
    calendar,
  };
}
