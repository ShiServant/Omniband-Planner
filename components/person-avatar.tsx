import { cn } from "cn";

export function PersonAvatar({
  name,
  url,
  size = "sm",
}: {
  name: string;
  url: string | null;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "md" ? "size-12 text-sm" : "size-8 text-xs";

  if (url) {
    return (
      // Avatar URLs are optional and can point at any host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={cn(sizeClass, "rounded-full object-cover")}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        sizeClass,
        "flex items-center justify-center rounded-full bg-muted font-medium",
      )}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
