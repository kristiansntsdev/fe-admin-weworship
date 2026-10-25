import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function VerifiedBadge({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  return (
    <span className="inline-flex shrink-0" title="Official account">
      <BadgeCheck
        className={cn("text-primary", size === "sm" ? "size-3.5" : "size-4", className)}
        aria-label="Official account"
      />
    </span>
  );
}
