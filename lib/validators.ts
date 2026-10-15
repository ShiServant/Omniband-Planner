import { z } from "zod";

const uuid = z.string().uuid("Choose a valid record.");
const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Enter a valid date.",
  );

export const personSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Enter a valid email.",
    ),
  contactInfo: z.string().trim(),
  avatarUrl: z.string().trim().refine((value) => {
    if (value === "") {
      return true;
    }

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter an http or https avatar URL."),
  active: z.boolean(),
});

export const projectSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    description: z.string().trim(),
    objective: z.string().trim(),
    status: z.enum(["planning", "in_progress", "completed", "archived"]),
    health: z.enum(["on_track", "at_risk", "blocked"]).nullable(),
    progress: z.number().int().min(0).max(100).nullable(),
    startDate: optionalDate,
    dueDate: optionalDate,
    currentUpdate: z.string().trim(),
    nextStep: z.string().trim(),
    nextMilestone: z.string().trim(),
    blocker: z.string().trim(),
    includeEveryone: z.boolean(),
    memberIds: z.array(uuid),
  })
  .superRefine((value, ctx) => {
    const active =
      value.status === "planning" || value.status === "in_progress";

    if (active && !value.health) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a health status for an active project.",
        path: ["health"],
      });
    }

    if (!active && value.health) {
      ctx.addIssue({
        code: "custom",
        message: "Completed and archived projects do not have a health status.",
        path: ["health"],
      });
    }

    if (
      value.startDate &&
      value.dueDate &&
      value.dueDate < value.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        message: "The target date cannot be before the start date.",
        path: ["dueDate"],
      });
    }

    if (new Set(value.memberIds).size !== value.memberIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "Each member can only be added once.",
        path: ["memberIds"],
      });
    }
  });

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim(),
  projectId: uuid,
  responsiblePersonIds: z
    .array(uuid)
    .min(1, "Choose at least one person."),
  status: z.enum(["in_progress", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueDate: optionalDate,
  important: z.boolean(),
});

export const meetingSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  meetingLocal: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Enter a date and time."),
  summary: z.string().trim(),
  projectIds: z.array(uuid),
});
