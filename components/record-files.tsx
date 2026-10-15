"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Attachment } from "@/lib/types";

export function useRecordFiles() {
  const pendingFiles = useRef<File[]>([]);
  const [pickedNames, setPickedNames] = useState<string[]>([]);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);

  function take(formData: FormData) {
    const files = pendingFiles.current.splice(0, pendingFiles.current.length);

    for (const file of files) {
      formData.append("attachment", file);
    }

    return files;
  }

  function restore(files: File[]) {
    pendingFiles.current.unshift(...files);
  }

  function clear() {
    setPickedNames([]);
    setRemovedFileIds([]);
  }

  return {
    pickedNames,
    setPickedNames,
    removedFileIds,
    setRemovedFileIds,
    pendingFiles,
    take,
    restore,
    clear,
  };
}

export function RecordFiles({
  files,
  recordId,
  downloadPath,
  pending,
  onChange,
}: {
  files: Attachment[];
  recordId?: string;
  downloadPath: (recordId: string, fileId: string) => string;
  pending: ReturnType<typeof useRecordFiles>;
  onChange: () => void;
}) {
  const visibleFiles = files.filter(
    (file) => !pending.removedFileIds.includes(file.id),
  );

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold">Files</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Attach notes, slides, or other documents. Each file can be up to 4 MB.
        </p>
      </div>
      {pending.removedFileIds.map((fileId) => (
        <input key={fileId} type="hidden" name="removeFileId" value={fileId} />
      ))}
      {visibleFiles.length > 0 ? (
        <ul className="flex flex-col gap-2 text-sm">
          {visibleFiles.map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-3">
              <a
                href={
                  recordId ? downloadPath(recordId, file.id) : "#"
                }
                className="underline-offset-4 hover:underline"
              >
                {file.fileName}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  pending.setRemovedFileIds((current) => [...current, file.id]);
                  onChange();
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {pending.pickedNames.length > 0 ? (
        <ul className="text-sm text-muted-foreground">
          {pending.pickedNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : null}
      <label className="pressable inline-flex w-fit cursor-pointer text-sm underline underline-offset-4 hover:text-foreground">
        Choose files
        <input
          type="file"
          multiple
          onChange={(event) => {
            const chosen = [...(event.currentTarget.files ?? [])];

            if (chosen.length === 0) {
              return;
            }

            pending.pendingFiles.current.push(...chosen);
            pending.setPickedNames((current) => [
              ...current,
              ...chosen.map((file) => file.name),
            ]);
            event.currentTarget.value = "";
            onChange();
          }}
          className="sr-only"
        />
      </label>
    </section>
  );
}
