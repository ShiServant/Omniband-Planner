"use client";

import { useState } from "react";
import { ProjectSummaryList } from "@/components/project-summary-list";
import type { ProjectSummary } from "@/lib/types";

const PREVIEW_COUNT = 5;

export function ActiveProjects({ projects }: { projects: ProjectSummary[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? projects : projects.slice(0, PREVIEW_COUNT);

  return (
    <>
      <ProjectSummaryList projects={visible} />
      {projects.length > PREVIEW_COUNT ? (
        <button
          type="button"
          className="mt-3 cursor-pointer text-sm underline underline-offset-4"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </>
  );
}
