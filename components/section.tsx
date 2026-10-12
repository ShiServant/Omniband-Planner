export function Section({
  title,
  prominent = false,
  children,
}: {
  title: string;
  prominent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2
        className={
          prominent
            ? "text-base font-semibold tracking-tight"
            : "text-sm font-medium text-muted-foreground"
        }
      >
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
