"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        Could not load this page
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The society records could not be read. Check the server database
        settings, then try again.
      </p>
      <Button type="button" variant="outline" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
