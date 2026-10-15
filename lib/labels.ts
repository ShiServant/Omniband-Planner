import type {
  ProjectHealth,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";

export function projectStatusLabel(status: ProjectStatus) {
  switch (status) {
    case "planning":
      return "Planning";
    case "in_progress":
      return "In progress";
    case "completed":
      return "Completed";
    case "archived":
      return "Archived";
  }
}

export function healthLabel(health: ProjectHealth) {
  switch (health) {
    case "on_track":
      return "On track";
    case "at_risk":
      return "Needs attention";
    case "blocked":
      return "Blocked";
  }
}

export function taskStatusLabel(status: TaskStatus) {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "done":
      return "Done";
  }
}

export function priorityLabel(priority: TaskPriority) {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "urgent":
      return "Urgent";
  }
}
