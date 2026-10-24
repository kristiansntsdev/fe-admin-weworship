import Link from "next/link";

import { Music } from "lucide-react";

import { cn } from "@/lib/utils";

import type { RankedSong } from "../_lib/types";

const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;

// Decorative cover art, picked by position so neighbouring cards never share a colour.
const COVERS = [
  "from-rose-500 to-red-900",
  "from-amber-400 to-orange-800",
  "from-fuchsia-500 to-purple-900",
  "from-sky-500 to-indigo-900",
  "from-emerald-500 to-teal-900",
];

export function TrendingSongs({ songs }: { songs: RankedSong[] }) {
  if (songs.length === 0) {
    return <p className="text-muted-foreground text-sm">No song views yet this week.</p>;
  }
  // -mx-4 bleeds the scroll track to the screen edge. Padding on overflow-x flex is ignored in
  // WebKit, so inset comes from first/last item margins instead of px-4 on the list.
  return (
    <ol className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {songs.map((s, i) => (
        <li
          key={s.id}
          className={cn(
            "w-36 shrink-0 snap-start",
            i === 0 && "ml-4",
            i === songs.length - 1 && "mr-4",
          )}
        >
          <Link href={`/prototype/songs/${s.id}`} className="block space-y-2">
            <div
              className={cn(
                "relative flex aspect-square items-end overflow-hidden rounded-xl bg-linear-to-br p-3 text-white",
                COVERS[i % COVERS.length],
              )}
            >
              <Music className="absolute top-3 right-3 size-5 opacity-60" />
              <span className="font-bold text-5xl tabular-nums leading-none opacity-90">{i + 1}</span>
            </div>
            <div>
              <p className="line-clamp-2 font-medium text-sm leading-snug">{s.title}</p>
              <p className="truncate text-muted-foreground text-xs">{s.artist || "Unknown artist"}</p>
              <p className="pt-0.5 text-muted-foreground text-xs tabular-nums">
                {s.key && `Key ${s.key} · `}
                {plural(s.count, "view")}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function MostAddedSongs({ songs }: { songs: RankedSong[] }) {
  if (songs.length === 0) {
    return <p className="text-muted-foreground text-sm">No playlist adds yet — add a song to a setlist to get started.</p>;
  }
  const max = Math.max(1, ...songs.map((s) => s.count));

  return (
    <ol className="divide-y rounded-2xl border">
      {songs.map((s, i) => (
        <li key={s.id}>
          <Link href={`/prototype/songs/${s.id}`} className="flex items-center gap-3 px-4 py-3">
            <span className="w-4 shrink-0 text-center font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium">{s.title}</span>
                <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                  {plural(s.count, "playlist")}
                </span>
              </span>
              <span className="block truncate text-muted-foreground text-sm">{s.artist || "Unknown artist"}</span>
              <span className="mt-1.5 block h-1.5 rounded-full bg-muted">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${(s.count / max) * 100}%` }} />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
