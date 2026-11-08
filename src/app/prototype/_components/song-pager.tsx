"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";

import { useQueries } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { qk } from "../_lib/api";
import { KEYS, keyRoot } from "../_lib/chordpro";
import { getSong } from "../_lib/songs";
import type { Song } from "../_lib/types";
import { LyricsChordSwitcher } from "./lyrics-chord-switcher";
import { PageHeader } from "./page-header";
import { SongDetailView } from "./song-detail-view";

/** Shift a key root by N semitones. */
function shiftKey(key: string | null | undefined, semitones: number): string | null {
  const root = keyRoot(key);
  if (!root) return null;
  const i = KEYS.indexOf(root);
  return KEYS[(((i + semitones) % 12) + 12) % 12];
}

const defaultKeyFor = (_songId: number, song: Song | undefined) => song?.base_chord ?? null;

// Play mode: one song per screen, swiped horizontally, with a chords toggle and a floating transpose.
// Used by playlists and mixes; the caller supplies the song list and handles loading it.
export function SongPager({
  songIds,
  keyFor = defaultKeyFor,
  title,
  backHref,
  startIndex,
  pending = false,
  unavailable,
  emptyDescription,
}: {
  songIds: number[];
  /** Key a song starts in before transposing (e.g. the playlist's key for it). Defaults to the song's own key. */
  keyFor?: (songId: number, song: Song | undefined) => string | null;
  /** Header title until the current song has loaded. */
  title: string;
  backHref: string;
  startIndex: number;
  /** The song list is still loading. */
  pending?: boolean;
  /** Shown instead of the pages when the song list failed to load. */
  unavailable?: ReactNode;
  /** Shown when the list loaded but is empty. */
  emptyDescription: string;
}) {
  const songQueries = useQueries({
    queries: songIds.map((sid) => ({
      queryKey: qk.song(sid),
      queryFn: () => getSong(sid),
      staleTime: 5 * 60_000,
    })),
  });
  const songsById = new Map<number, Song>();
  for (const q of songQueries) if (q.data) songsById.set(q.data.id, q.data);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLElement | null)[]>([]);
  const [index, setIndex] = useState(Math.min(startIndex, Math.max(songIds.length - 1, 0)));
  const [showChords, setShowChords] = useState(true);
  const [transposeOffset, setTransposeOffset] = useState(0);
  const didJump = useRef(false);

  const goTo = useCallback((i: number, behavior: ScrollBehavior = "smooth") => {
    const el = pageRefs.current[i];
    if (!el) return;
    el.scrollIntoView({ behavior, inline: "start", block: "nearest" });
    setIndex(i);
  }, []);

  // Track which page is centered via IntersectionObserver (native screen paging).
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || songIds.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        let best: { i: number; ratio: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.index);
          if (Number.isNaN(i)) continue;
          if (!best || e.intersectionRatio > best.ratio) best = { i, ratio: e.intersectionRatio };
        }
        if (best) setIndex(best.i);
      },
      { root, threshold: [0.55, 0.75, 0.9] },
    );

    for (const el of pageRefs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, [songIds.length]);

  // Jump to the start index once pages exist.
  useEffect(() => {
    if (didJump.current || songIds.length === 0) return;
    const target = Math.min(startIndex, songIds.length - 1);
    requestAnimationFrame(() => {
      goTo(target, "instant");
      didJump.current = true;
    });
  }, [songIds.length, startIndex, goTo]);

  const currentId = songIds[index];
  const currentSong = currentId != null ? songsById.get(currentId) : undefined;

  return (
    <>
      <PageHeader
        title={currentSong?.title ?? title}
        backHref={backHref}
        actions={
          songIds.length > 0 ? (
            <div className="flex items-center gap-2 pr-1">
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={index <= 0}
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous song"
                >
                  <ChevronLeft />
                </Button>
                <span className="min-w-10 text-center text-muted-foreground text-xs tabular-nums">
                  {index + 1}/{songIds.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={index >= songIds.length - 1}
                  onClick={() => goTo(index + 1)}
                  aria-label="Next song"
                >
                  <ChevronRight />
                </Button>
              </div>
              <LyricsChordSwitcher showChords={showChords} onShowChordsChange={setShowChords} />
            </div>
          ) : undefined
        }
      />

      {pending ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : unavailable ? (
        unavailable
      ) : songIds.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No songs to play</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" asChild>
              <Link href={backHref}>Back</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {songIds.map((sid, i) => {
            const song = songsById.get(sid);
            const failed = songQueries[i]?.isError;
            return (
              <section
                key={sid}
                data-index={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                className="h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain"
              >
                {song ? (
                  <SongDetailView
                    song={song}
                    variant="play"
                    initialKey={shiftKey(keyFor(sid, song), transposeOffset)}
                    showChords={showChords}
                    onShowChordsChange={setShowChords}
                  />
                ) : failed ? (
                  <p className="p-4 text-muted-foreground text-sm">Song unavailable</p>
                ) : (
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {songIds.length > 0 && (
        <div className="pointer-events-none fixed right-4 bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)] z-50 flex flex-col items-end gap-2">
          <Button
            type="button"
            size="icon"
            className="pointer-events-auto size-12 rounded-full shadow-lg"
            onClick={() => setTransposeOffset((n) => n + 1)}
            aria-label="Transpose up"
          >
            <Plus className="size-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="pointer-events-auto size-12 rounded-full shadow-lg"
            onClick={() => setTransposeOffset((n) => n - 1)}
            aria-label="Transpose down"
          >
            <Minus className="size-5" />
          </Button>
        </div>
      )}
    </>
  );
}
