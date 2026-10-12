import "server-only";

import { cache } from "react";
import { failRead, one, type DataResult } from "@/lib/data/read";
import { isUuid } from "@/lib/format";
import { getReadClient } from "@/lib/supabase/read";
import type {
  NamedRef,
  ProjectDetail,
  ProjectHealth,
  ProjectStatus,
  ProjectSummary,
} from "@/lib/types";
import {
  compareTasks,
  mapTask,
  TASK_SELECT,
  type TaskRow,
} from "@/lib/data/tasks";

const PROJECT_SELECT = `
  id,
  name,
  description,
  objective,
  status,
  health,
  progress,
  start_date,
  due_date,
  current_update,
  next_step,
  next_milestone,
  blocker,
  updated_at,
  lead:people!lead_person_id (id, name, active)
`;

type LeadRow = NamedRef & { active: boolean };

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  objective: string | null;
  status: ProjectStatus;
  health: ProjectHealth | null;
  progress: number | null;
  start_date: string | null;
  due_date: string | null;
  current_update: string | null;
  next_step: string | null;
  next_milestone: string | null;
  blocker: string | null;
  updated_at: string;
  lead: LeadRow | LeadRow[] | null;
};

export type ProjectView = "all" | "active" | "completed" | "archived";

function mapProject(row: ProjectRow): ProjectSummary {
  const lead = one(row.lead);

  if (!lead) {
    failRead("projects", `Project ${row.id} is missing its lead.`);
  }

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    health: row.health,
    progress: row.progress,
    lead,
    nextStep: row.next_step,
    nextMilestone: row.next_milestone,
    dueDate: row.due_date,
    startDate: row.start_date,
    blocker: row.blocker,
    currentUpdate: row.current_update,
    updatedAt: row.updated_at,
  };
}

function sortProjects(projects: ProjectSummary[], view: ProjectView) {
  if (view === "completed" || view === "archived") {
    return projects.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  if (view === "active") {
    return projects.sort((a, b) => {
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
    });
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export async function listProjects(
  view: ProjectView = "all",
): Promise<DataResult<ProjectSummary[]>> {
  const client = getReadClient();

  if (!client) {
    return { configured: false };
  }

  const base = client.from("projects").select(PROJECT_SELECT);
  const filtered =
    view === "active"
      ? base.in("status", ["planning", "in_progress"])
      : view === "completed"
        ? base.eq("status", "completed")
        : view === "archived"
          ? base.eq("status", "archived")
          : base;
  const { data, error } = await filtered;

  if (error) {
    failRead("projects", error.message);
  }

  return {
    configured: true,
    data: sortProjects(((data ?? []) as ProjectRow[]).map(mapProject), view),
  };
}

type MemberRow = {
  role: string;
  person: (NamedRef & { active: boolean }) | Array<NamedRef & { active: boolean }> | null;
};

type MeetingLinkRow = {
  meeting: {
    id: string;
    title: string;
    meeting_date: string;
    summary: string | null;
  } | Array<{
    id: string;
    title: string;
    meeting_date: string;
    summary: string | null;
  }> | null;
};

type DecisionRow = {
  id: string;
  content: string;
  meeting: {
    id: string;
    title: string;
    meeting_date: string;
  } | Array<{
    id: string;
    title: string;
    meeting_date: string;
  }> | null;
};

export const getProject = cache(
  async (id: string): Promise<DataResult<ProjectDetail | null>> => {
    if (!isUuid(id)) {
      return { configured: true, data: null };
    }

    const client = getReadClient();

    if (!client) {
      return { configured: false };
    }

    const projectResult = await client
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (projectResult.error) {
      failRead("project", projectResult.error.message);
    }

    if (!projectResult.data) {
      return { configured: true, data: null };
    }

    const [membersResult, tasksResult, meetingsResult, decisionsResult] =
      await Promise.all([
        client
          .from("project_members")
          .select("role, person:people!person_id (id, name, active)")
          .eq("project_id", id),
        client.from("tasks").select(TASK_SELECT).eq("project_id", id),
        client
          .from("meeting_projects")
          .select(
            "meeting:meetings!meeting_id (id, title, meeting_date, summary)",
          )
          .eq("project_id", id),
        client
          .from("decisions")
          .select(
            "id, content, meeting:meetings!meeting_id (id, title, meeting_date)",
          )
          .eq("project_id", id),
      ]);

    if (membersResult.error) {
      failRead("project members", membersResult.error.message);
    }

    if (tasksResult.error) {
      failRead("project tasks", tasksResult.error.message);
    }

    if (meetingsResult.error) {
      failRead("project meetings", meetingsResult.error.message);
    }

    if (decisionsResult.error) {
      failRead("project decisions", decisionsResult.error.message);
    }

    const row = projectResult.data as ProjectRow;
    const summary = mapProject(row);
    const lead = one(row.lead);

    if (!lead) {
      failRead("project", "Project is missing its lead.");
    }
    const members = ((membersResult.data ?? []) as MemberRow[])
      .flatMap((member) => {
        const person = one(member.person);

        if (!person || person.id === summary.lead.id) {
          return [];
        }

        return [{ ...person, role: member.role }];
      })
      .sort((a, b) => a.name.localeCompare(b.name, "en"));

    const tasks = ((tasksResult.data ?? []) as TaskRow[])
      .map(mapTask)
      .sort(compareTasks);
    const meetings = ((meetingsResult.data ?? []) as MeetingLinkRow[])
      .flatMap((link) => {
        const meeting = one(link.meeting);

        if (!meeting) {
          return [];
        }

        return [
          {
            id: meeting.id,
            title: meeting.title,
            meetingDate: meeting.meeting_date,
            summary: meeting.summary,
          },
        ];
      })
      .sort((a, b) => (a.meetingDate < b.meetingDate ? 1 : -1));
    const decisions = ((decisionsResult.data ?? []) as DecisionRow[])
      .flatMap((decision) => {
        const meeting = one(decision.meeting);

        if (!meeting) {
          return [];
        }

        return [
          {
            id: decision.id,
            content: decision.content,
            meeting: {
              id: meeting.id,
              title: meeting.title,
              meetingDate: meeting.meeting_date,
            },
          },
        ];
      })
      .sort((a, b) =>
        a.meeting.meetingDate < b.meeting.meetingDate ? 1 : -1,
      );

    return {
      configured: true,
      data: {
        ...summary,
        description: row.description,
        objective: row.objective,
        members: [
          { id: lead.id, name: lead.name, role: "Lead", active: lead.active },
          ...members,
        ],
        tasks,
        meetings,
        decisions,
      },
    };
  },
);
