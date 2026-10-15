"use client";

import { useState } from "react";
import { cn } from "cn";
import type { CalendarEntry } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthCalendar({
  today,
  entries,
}: {
  today: string;
  entries: CalendarEntry[];
}) {
  const [cursor, setCursor] = useState(() => today.slice(0, 7));
  const [year, month] = cursor.split("-").map(Number);
  const byDate = new Map<string, CalendarEntry[]>();

  for (const entry of entries) {
    const current = byDate.get(entry.date) ?? [];
    current.push(entry);
    byDate.set(entry.date, current);
  }

  const cells = monthCells(year, month);
  const label = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return (
    <div className="max-w-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          className="cursor-pointer text-sm underline underline-offset-4"
          onClick={() => setCursor(shiftMonth(year, month, -1))}
        >
          Previous
        </button>
        <p className="text-sm font-medium">{label}</p>
        <button
          type="button"
          className="cursor-pointer text-sm underline underline-offset-4"
          onClick={() => setCursor(shiftMonth(year, month, 1))}
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          const dayEntries = date ? (byDate.get(date) ?? []) : [];
          const projects = dayEntries.filter((entry) => entry.kind === "project");
          const deadlines = dayEntries.filter((entry) => entry.kind === "deadline");
          const marked = dayEntries.length > 0;

          return (
            <div key={date ?? `empty-${index}`} className="relative">
              {date ? (
                <DayCell
                  date={date}
                  today={today}
                  marked={marked}
                  hasProject={projects.length > 0}
                  hasDeadline={deadlines.length > 0}
                  projects={projects}
                  deadlines={deadlines}
                  alignEnd={index % 7 >= 4}
                />
              ) : (
                <div className="h-14" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayCell({
  date,
  today,
  marked,
  hasProject,
  hasDeadline,
  projects,
  deadlines,
  alignEnd,
}: {
  date: string;
  today: string;
  marked: boolean;
  hasProject: boolean;
  hasDeadline: boolean;
  projects: CalendarEntry[];
  deadlines: CalendarEntry[];
  alignEnd: boolean;
}) {
  const day = Number(date.slice(8, 10));
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "flex h-14 w-full flex-col items-center justify-center rounded-md text-sm",
          date === today && "ring-1 ring-foreground",
          marked && "bg-muted font-medium",
        )}
        aria-label={dayLabel(date, projects, deadlines)}
      >
        {day}
        <span className="mt-1 flex h-1.5 gap-1">
          {hasProject ? (
            <span className="size-1.5 rounded-full bg-foreground" />
          ) : null}
          {hasDeadline ? <span className="size-1.5 rounded-full bg-red-600" /> : null}
        </span>
      </button>
      {open && marked ? (
        <div
          className={cn(
            "absolute top-full z-20 w-56 rounded-md border bg-background p-3 text-left shadow-md",
            alignEnd ? "right-0" : "left-0",
          )}
        >
          {projects.length > 0 ? (
            <EntryList title="Projects ending" entries={projects} />
          ) : null}
          {deadlines.length > 0 ? (
            <EntryList title="Deadlines" entries={deadlines} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function EntryList({
  title,
  entries,
}: {
  title: string;
  entries: CalendarEntry[];
}) {
  return (
    <div className="mt-2 first:mt-0">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="mt-1 flex flex-col gap-1">
        {entries.map((entry) => (
          <li key={`${entry.kind}-${entry.title}-${entry.detail}`} className="text-sm">
            <p className="font-medium">{entry.title}</p>
            <p className="text-xs text-muted-foreground">{entry.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function dayLabel(
  date: string,
  projects: CalendarEntry[],
  deadlines: CalendarEntry[],
) {
  const names = [...projects, ...deadlines].map((entry) => entry.title);
  return names.length > 0 ? `${date}: ${names.join(", ")}` : date;
}

function monthCells(year: number, month: number) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leading = (firstWeekday + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<string | null> = [];

  for (let index = 0; index < leading; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= days; day += 1) {
    cells.push(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
