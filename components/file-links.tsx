import type { Attachment } from "@/lib/types";

export function FileLinks({
  files,
  href,
}: {
  files: Attachment[];
  href: (fileId: string) => string;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <ul className="mt-2 flex flex-col gap-1 text-sm">
      {files.map((file) => (
        <li key={file.id}>
          <a
            href={href(file.id)}
            className="underline-offset-4 hover:underline"
          >
            {file.fileName}
          </a>
        </li>
      ))}
    </ul>
  );
}
