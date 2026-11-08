import { cn } from "@/lib/utils";

// Profile photo, or the username's first letter on a coloured circle. Size via className (default size-10).
export function UserAvatar({
  username,
  avatarUrl,
  className,
}: {
  username: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  if (avatarUrl) {
    // biome-ignore lint/performance/noImgElement: avatar hosts vary; next/image would need every host in remotePatterns
    return <img src={avatarUrl} alt="" className={cn("size-10 shrink-0 rounded-full object-cover", className)} />;
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground uppercase",
        className,
      )}
    >
      {username.slice(0, 1)}
    </span>
  );
}
