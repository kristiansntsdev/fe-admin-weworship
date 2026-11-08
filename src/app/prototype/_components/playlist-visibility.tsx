"use client";

import { Globe, Lock } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

// Private / Public picker for new playlists. Callers start it at private (false) — the product default.
export function VisibilityToggle({
  isPublic,
  onChange,
  disabled,
  className,
}: {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={isPublic ? "public" : "private"}
      // Radix sends "" when the active item is clicked again — keep the current choice.
      onValueChange={(v) => v && onChange(v === "public")}
      disabled={disabled}
      aria-label="Playlist visibility"
      className={cn("w-full", className)}
    >
      <ToggleGroupItem value="private" className="flex-1">
        <Lock />
        Private
      </ToggleGroupItem>
      <ToggleGroupItem value="public" className="flex-1">
        <Globe />
        Public
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function VisibilityIcon({ isPublic, className }: { isPublic: boolean; className?: string }) {
  const Icon = isPublic ? Globe : Lock;
  return <Icon aria-hidden className={cn("size-3 shrink-0", className)} />;
}

// Inline "🔒 Private" / "🌐 Public" for list subtitles.
export function VisibilityLabel({ isPublic, className }: { isPublic: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <VisibilityIcon isPublic={isPublic} />
      {isPublic ? "Public" : "Private"}
    </span>
  );
}
