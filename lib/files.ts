import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { fields } from "@/lib/forms";
import { isUuid } from "@/lib/format";
import { SaveError, throwDb } from "@/lib/supabase/admin";
import { getReadClient } from "@/lib/supabase/read";
import type { Attachment, TaskSummary } from "@/lib/types";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

type FileTable = "meeting_files" | "project_files" | "task_files";
type ParentColumn = "meeting_id" | "project_id" | "task_id";

type ReadClient = NonNullable<ReturnType<typeof getReadClient>>;

export async function listAttachments(
  client: ReadClient,
  table: FileTable,
  parentColumn: ParentColumn,
  parentId: string,
): Promise<Attachment[]> {
  const { data, error } = await client
    .from(table)
    .select(`id, file_name, ${parentColumn}`)
    .eq(parentColumn, parentId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return ((data ?? []) as Array<{ id: string; file_name: string }>).map(
    (file) => ({
      id: file.id,
      fileName: file.file_name,
    }),
  );
}

export async function loadTaskFiles(
  client: ReadClient,
  tasks: TaskSummary[],
): Promise<TaskSummary[]> {
  if (tasks.length === 0) {
    return tasks;
  }

  const { data, error } = await client
    .from("task_files")
    .select("id, file_name, task_id")
    .in(
      "task_id",
      tasks.map((task) => task.id),
    )
    .order("created_at", { ascending: true });

  if (error) {
    return tasks.map((task) => ({ ...task, files: [] }));
  }

  const byTask = new Map<string, Attachment[]>();

  for (const row of (data ?? []) as Array<{
    id: string;
    file_name: string;
    task_id: string;
  }>) {
    const current = byTask.get(row.task_id) ?? [];
    current.push({ id: row.id, fileName: row.file_name });
    byTask.set(row.task_id, current);
  }

  return tasks.map((task) => ({
    ...task,
    files: byTask.get(task.id) ?? [],
  }));
}

export async function syncAttachments(
  db: SupabaseClient,
  table: FileTable,
  parentColumn: ParentColumn,
  parentId: string,
  formData: FormData,
) {
  const removeIds = fields(formData, "removeFileId").filter(isUuid);

  if (removeIds.length > 0) {
    const removed = await db
      .from(table)
      .delete()
      .eq(parentColumn, parentId)
      .in("id", removeIds);

    if (removed.error) {
      throwFileError(removed.error, table);
    }
  }

  const attachments = formData
    .getAll("attachment")
    .filter((item): item is File => item instanceof File && item.size > 0);

  for (const file of attachments) {
    if (file.size > MAX_FILE_BYTES) {
      throw new SaveError("Each file must be 4 MB or smaller.");
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const inserted = await db.from(table).insert({
      [parentColumn]: parentId,
      file_name: file.name.trim().slice(0, 200) || "file",
      content_type: file.type || "application/octet-stream",
      content_base64: bytes.toString("base64"),
    });

    if (inserted.error) {
      throwFileError(inserted.error, table);
    }
  }
}

export async function downloadAttachment(
  table: FileTable,
  parentColumn: ParentColumn,
  parentId: string,
  fileId: string,
) {
  if (!isUuid(parentId) || !isUuid(fileId)) {
    return new Response("Not found", { status: 404 });
  }

  const client = getReadClient();

  if (!client) {
    return new Response("Not found", { status: 404 });
  }

  const { data, error } = await client
    .from(table)
    .select("file_name, content_type, content_base64")
    .eq("id", fileId)
    .eq(parentColumn, parentId)
    .maybeSingle();

  if (error || !data) {
    return new Response("Not found", { status: 404 });
  }

  const file = data as {
    file_name: string;
    content_type: string | null;
    content_base64: string;
  };
  const bytes = Buffer.from(file.content_base64, "base64");
  const name = file.file_name.replace(/["\r\n]/g, "");

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.content_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}

function throwFileError(
  error: { code?: string; message?: string },
  table: FileTable,
) {
  const text = error.message ?? "";
  const missing =
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    text.toLowerCase().includes(table);

  if (missing) {
    throw new SaveError(
      "File attachments are not available yet. Add the latest database migration in Supabase.",
    );
  }

  throwDb(error);
}
