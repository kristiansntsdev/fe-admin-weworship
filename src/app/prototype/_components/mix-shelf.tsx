"use client";

import Link from "next/link";

import { AudioLines, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { mixHref, moodMixKey, useMixes } from "../_lib/mixes";
import type { Mix, MixMood } from "../_lib/types";
import { COVERS } from "./song-rankings";

// Same key → same colour on the home card, the mix page and anywhere else the mix shows up.
function coverClass(key: string) {
  const numbered = /^mix-(\d+)$/.exec(key);
  if (numbered) return COVERS[(Number(numbered[1]) - 1) % COVERS.length];
  if (key === "supermix") return COVERS[3];
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COVERS[hash % COVERS.length];
}

// "Mix 1" → "Mix" / "01" and "Supermix" → "Super" / "mix", like the cover art in music apps.
function coverLines(title: string): [string, string] | [string] {
  const numbered = /^Mix (\d+)$/.exec(title);
  if (numbered) return ["Mix", numbered[1].padStart(2, "0")];
  if (title === "Supermix") return ["Super", "mix"];
  return [title];
}

export function MixCover({ mix, className }: { mix: Pick<Mix, "key" | "title">; className?: string }) {
  const [first, second] = coverLines(mix.title);
  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col justify-end overflow-hidden rounded-xl bg-linear-to-br p-3 text-white",
        coverClass(mix.key),
        className,
      )}
    >
      <AudioLines aria-hidden className="absolute top-3 right-3 size-5 opacity-60" />
      {second ? (
        <>
          <span className="font-semibold text-sm leading-tight opacity-85">{first}</span>
          <span className="font-bold text-4xl tabular-nums leading-none">{second}</span>
        </>
      ) : (
        <span className="break-words font-bold text-lg leading-tight">{first}</span>
      )}
    </div>
  );
}

// -mx-4 bleeds the track to the screen edge; first/last item margins give the inset (WebKit ignores padding on
// overflow-x flex), and scroll-px-4 keeps snap-start from pinning the first card to the edge. See song-rankings.tsx.
const TRACK = "-mx-4 flex scroll-px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const edge = (i: number, count: number) => cn(i === 0 && "ml-4", i === count - 1 && "mr-4");

function MoodChips({ moods }: { moods: MixMood[] }) {
  return (
    <ul className={cn(TRACK, "gap-2")} aria-label="Mood mixes">
      {moods.map((m, i) => (
        <li key={m.id} className={cn("shrink-0", edge(i, moods.length))}>
          <Button asChild variant="secondary" size="sm" className="rounded-full px-4">
            <Link href={mixHref(moodMixKey(m.id))}>{m.label}</Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

function MixCards({ mixes }: { mixes: Mix[] }) {
  return (
    <ol className={cn(TRACK, "snap-x snap-mandatory gap-3 pb-2")}>
      {mixes.map((mix, i) => (
        <li key={mix.key} className={cn("w-36 shrink-0 snap-start", edge(i, mixes.length))}>
          <Link href={mixHref(mix.key)} className="block space-y-2">
            <MixCover mix={mix} />
            <div>
              <p className="truncate font-medium text-sm">{mix.title}</p>
              <p className="line-clamp-2 text-muted-foreground text-xs leading-snug">
                {mix.subtitle || `${mix.songs.length} songs`}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function ShelfSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          <Skeleton key={i} className="aspect-square w-36 shrink-0 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// "Mixed for you" on the signed-in home: mood chips plus personal mixes built from the user's history.
export function MixShelf() {
  const { data, isPending, isError } = useMixes();

  // No moods and no mixes means the server has no embedding service — nothing to offer.
  if (data && data.moods.length === 0 && data.mixes.length === 0) return null;

  return (
    <div>
      <div className="pb-3">
        <p className="font-semibold text-primary text-xs uppercase tracking-wider">For you</p>
        <h3 className="font-semibold text-lg tracking-tight">Mixed for you</h3>
      </div>

      {isPending ? (
        <ShelfSkeleton />
      ) : isError || !data ? (
        <p className="text-muted-foreground text-sm">Couldn’t load your mixes right now.</p>
      ) : (
        <div className="space-y-3">
          {data.moods.length > 0 && <MoodChips moods={data.moods} />}
          {data.mixes.length > 0 ? (
            <MixCards mixes={data.mixes} />
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <p className="text-muted-foreground text-sm">
                Open, favorite or add a few songs to a playlist and your personal mixes show up here. Until then, pick a
                mood above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
