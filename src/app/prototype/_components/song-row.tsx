import type { ReactNode } from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { artistLabel } from "../_lib/songs";
import type { Song } from "../_lib/types";

export function SongRow({ song, href, action }: { song: Song; href: string; action?: ReactNode }) {
  return (
    <li className="flex items-center gap-2 px-4">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{song.title}</p>
          <p className="truncate text-muted-foreground text-sm">{artistLabel(song.artist) || "Unknown artist"}</p>
        </div>
        {song.base_chord && (
          <Badge variant="outline" className="shrink-0 font-mono">
            {song.base_chord}
          </Badge>
        )}
      </Link>
      {action}
    </li>
  );
}
