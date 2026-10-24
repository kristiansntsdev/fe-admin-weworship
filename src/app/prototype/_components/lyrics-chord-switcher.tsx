"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function LyricsChordSwitcher({
  showChords,
  onShowChordsChange,
  className,
}: {
  showChords: boolean;
  onShowChordsChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={showChords ? "chords" : "lyrics"}
      onValueChange={(v) => {
        if (!v) return; // don't allow deselecting the active mode
        onShowChordsChange(v === "chords");
      }}
      className={cn("shrink-0", className)}
      aria-label="Display mode"
    >
      <ToggleGroupItem value="lyrics" className="px-2.5 text-xs sm:text-sm">
        Lyrics
      </ToggleGroupItem>
      <ToggleGroupItem value="chords" className="px-2.5 text-xs sm:text-sm">
        Chords
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
