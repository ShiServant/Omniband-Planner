import "server-only";

import { cache } from "react";
import { failRead, one, type DataResult } from "@/lib/data/read";
import { isUuid } from "@/lib/format";
import { getReadClient } from "@/lib/supabase/read";
import { compareTasks, mapTask, TASK_SELECT, type TaskRow } from "@/lib/data/tasks";
import type {
  PersonDetail,
  PersonProject,
  PersonSummary,
  ProjectHealth,
  ProjectStatus,
} from "@/lib/types";

type PersonRow = {
  id: string;
  name: string;
  society_role: string | null;
  email: string | null;
  contact_info: string | null;
  avatar_url: string | null;
  active: boolean;
};

function mapPerson(row: PersonRow): PersonSummary {
  return {
    id: row.id,
    name: row.name,
    societyRole: row.society_role,
    email: row.email,
    contactInfo: row.contact_info,
    avatarUrl: row.avatar_url,
    active: row.active,
  };
}

export async function listPeople(): Promise<DataResult<PersonSummary[]>> {
  const client = getReadClient();

  if (!client) {
    return { configured: false };
  }

  const { data, error } = await client
    .from("people")
    .select(
      "id, name, society_role, email, contact_info, avatar_url, active",
    )
    .order("active", { ascending: false })
    .order("name");

  if (error) {
    failRead("people", error.message);
  }

  return {
    configured: true,
    data: ((data ?? []) as PersonRow[]).map(mapPerson),
  };
}

type LedRow = {
  id: string;
  name: string;
  status: ProjectStatus;
  health: ProjectHealth | null;
};

type MemberRow = {
  role: string;
  project: LedRow | LedRow[] | null;
};

export const getPerson = cache(
  async (id: string): Promise<DataResult<PersonDetail | null>> => {
    if (!isUuid(id)) {
      return { configured: true, data: null };
    }

    const client = getReadClient();

    if (!client) {
      return { configured: false };
    }

    const personResult = await client
      .from("people")
      .select(
        "id, name, society_role, email, contact_info, avatar_url, active",
      )
      .eq("id", id)
      .maybeSingle();

    if (personResult.error) {
      failRead("person", personResult.error.message);
    }

    if (!personResult.data) {
      return { configured: true, data: null };
    }

    const [ledResult, memberResult, taskResult] = await Promise.all([
      client
        .from("projects")
        .select("id, name, status, health")
        .eq("lead_person_id", id),
      client
        .from("project_members")
        .select("role, project:projects!project_id (id, name, status, health)")
        .eq("person_id", id),
      client.from("tasks").select(TASK_SELECT).eq("responsible_person_id", id),
    ]);

    if (ledResult.error) {
      failRead("person projects", ledResult.error.message);
    }

    if (memberResult.error) {
      failRead("person memberships", memberResult.error.message);
    }

    if (taskResult.error) {
      failRead("person tasks", taskResult.error.message);
    }

    const led = ((ledResult.data ?? []) as LedRow[]).map(
      (project): PersonProject => ({
        id: project.id,
        name: project.name,
        status: project.status,
        health: project.health,
        role: "Lead",
      }),
    );
    const ledIds = new Set(led.map((project) => project.id));
    const memberships = ((memberResult.data ?? []) as MemberRow[]).flatMap(
      (member) => {
        const project = one(member.project);

        if (!project || ledIds.has(project.id)) {
          return [];
        }

        return [
          {
            id: project.id,
            name: project.name,
            status: project.status,
            health: project.health,
            role: member.role,
          },
        ];
      },
    );

    return {
      configured: true,
      data: {
        ...mapPerson(personResult.data as PersonRow),
        projects: [...led, ...memberships].sort((a, b) => {
          if ((a.role === "Lead") !== (b.role === "Lead")) {
            return a.role === "Lead" ? -1 : 1;
          }

          return a.name.localeCompare(b.name, "en");
        }),
        tasks: ((taskResult.data ?? []) as TaskRow[])
          .map(mapTask)
          .sort(compareTasks),
      },
    };
  },
);
