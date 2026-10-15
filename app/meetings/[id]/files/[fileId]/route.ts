import { downloadAttachment } from "@/lib/files";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; fileId: string }> },
) {
  const { id, fileId } = await context.params;
  return downloadAttachment("meeting_files", "meeting_id", id, fileId);
}
