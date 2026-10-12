import type { ReactNode } from "react";

export function Section({
  title,
  prominent = false,
  action,
  children,
}: {
  title: string;
  prominent?: boolean;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          className={
            prominent
              ? "text-base font-semibold tracking-tight"
              : "text-sm font-medium text-muted-foreground"
          }
        >
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
