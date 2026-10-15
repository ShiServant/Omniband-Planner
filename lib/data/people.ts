import "server-only";

import { cache } from "react";
import { failRead, one, type DataResult } from "@/lib/data/read";
import { isUuid } from "@/lib/format";
import { getReadClient } from "@/lib/supabase/read";
import {
  compareTasks,
  mapTask,
  readTaskRows,
  taskIdsForPerson,
} from "@/lib/data/tasks";
import { loadTaskFiles } from "@/lib/files";
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

  const roster = [
    "Lisa",
    "Kevin",
    "Chris",
    "Yuro",
    "Haobo",
    "Jenevieve",
    "Eric",
    "Frank",
  ];

  return {
    configured: true,
    data: ((data ?? []) as PersonRow[]).map(mapPerson).sort((a, b) => {
      const aIndex = roster.indexOf(a.name);
      const bIndex = roster.indexOf(b.name);

      if (aIndex === -1 && bIndex === -1) {
        return a.name.localeCompare(b.name);
      }

      if (aIndex === -1) {
        return 1;
      }

      if (bIndex === -1) {
        return -1;
      }

      return aIndex - bIndex;
    }),
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

    const responsibleTaskIds = await taskIdsForPerson(client, id);
    const [everyoneResult, memberResult, taskRows] = await Promise.all([
      client
        .from("projects")
        .select("id, name, status, health")
        .eq("include_everyone", true),
      client
        .from("project_members")
        .select("role, project:projects!project_id (id, name, status, health)")
        .eq("person_id", id),
      responsibleTaskIds.length === 0
        ? Promise.resolve([])
        : readTaskRows("person tasks", (columns) =>
            client.from("tasks").select(columns).in("id", responsibleTaskIds),
          ),
    ]);

    if (everyoneResult.error) {
      failRead("person projects", everyoneResult.error.message);
    }

    if (memberResult.error) {
      failRead("person memberships", memberResult.error.message);
    }

    const memberships = ((memberResult.data ?? []) as MemberRow[]).flatMap(
      (member) => {
        const project = one(member.project);

        if (!project) {
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
    const memberIds = new Set(memberships.map((project) => project.id));
    const everyone = ((everyoneResult.data ?? []) as LedRow[])
      .filter((project) => !memberIds.has(project.id))
      .map(
        (project): PersonProject => ({
          id: project.id,
          name: project.name,
          status: project.status,
          health: project.health,
          role: "Everyone",
        }),
      );

    return {
      configured: true,
      data: {
        ...mapPerson(personResult.data as PersonRow),
        projects: [...memberships, ...everyone].sort((a, b) =>
          a.name.localeCompare(b.name, "en"),
        ),
        tasks: await loadTaskFiles(
          client,
          taskRows.map(mapTask).sort(compareTasks),
        ),
      },
    };
  },
);
