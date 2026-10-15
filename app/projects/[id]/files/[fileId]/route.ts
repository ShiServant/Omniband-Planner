import { downloadAttachment } from "@/lib/files";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; fileId: string }> },
) {
  const { id, fileId } = await context.params;
  return downloadAttachment("project_files", "project_id", id, fileId);
}
