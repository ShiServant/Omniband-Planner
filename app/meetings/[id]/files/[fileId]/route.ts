import { isUuid } from "@/lib/format";
import { getReadClient } from "@/lib/supabase/read";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; fileId: string }> },
) {
  const { id, fileId } = await context.params;

  if (!isUuid(id) || !isUuid(fileId)) {
    return new Response("Not found", { status: 404 });
  }

  const client = getReadClient();

  if (!client) {
    return new Response("Not found", { status: 404 });
  }

  const { data, error } = await client
    .from("meeting_files")
    .select("file_name, content_type, content_base64")
    .eq("id", fileId)
    .eq("meeting_id", id)
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
