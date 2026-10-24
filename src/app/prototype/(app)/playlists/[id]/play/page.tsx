"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";

import { useQueries, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";

import { PageHeader } from "../../../../_components/page-header";
import { SongDetailView } from "../../../../_components/song-detail-view";
import { errorMessage, qk } from "../../../../_lib/api";
import { KEYS, keyRoot } from "../../../../_lib/chordpro";
import { getPlaylist } from "../../../../_lib/playlists";
import { getSong } from "../../../../_lib/songs";
import type { Song } from "../../../../_lib/types";

/** Shift a key root by N semitones. */
function shiftKey(key: string | null | undefined, semitones: number): string | null {
  const root = keyRoot(key);
  if (!root) return null;
  const i = KEYS.indexOf(root);
  return KEYS[((i + semitones) % 12 + 12) % 12];
}

export default function PlaylistPlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ i?: string }>;
}) {
  const { id } = use(params);
  const { i: startParam } = use(searchParams);
  const playlistId = Number(id);
  const startIndex = Math.max(0, Number(startParam) || 0);

  const playlistQuery = useQuery({ queryKey: qk.playlist(playlistId), queryFn: () => getPlaylist(playlistId) });
  const playlist = playlistQuery.data;
  const songIds = playlist?.songs ?? [];

  const songQueries = useQueries({
    queries: songIds.map((sid) => ({
      queryKey: qk.song(sid),
      queryFn: () => getSong(sid),
      staleTime: 5 * 60_000,
    })),
  });
  const songsById = new Map<number, Song>();
  for (const q of songQueries) if (q.data) songsById.set(q.data.id, q.data);

  const keyFor = (sid: number) => playlist?.song_keys?.[String(sid)] ?? songsById.get(sid)?.base_chord ?? null;

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

  // Jump to ?i= once pages exist.
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
  const backHref = `/prototype/playlists/${playlistId}`;

  return (
    <>
      <PageHeader
        title={currentSong?.title ?? playlist?.playlist_name ?? "Play"}
        backHref={backHref}
        actions={
          songIds.length > 0 ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={index <= 0}
                onClick={() => goTo(index - 1)}
                aria-label="Previous song"
              >
                <ChevronLeft />
              </Button>
              <span className="min-w-12 text-center text-muted-foreground text-sm tabular-nums">
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
          ) : undefined
        }
      />

      {playlistQuery.isPending ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : playlistQuery.isError || !playlist ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Playlist unavailable</EmptyTitle>
            <EmptyDescription>{errorMessage(playlistQuery.error)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" asChild>
              <Link href="/prototype/playlists">Back to playlists</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : songIds.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No songs to play</EmptyTitle>
            <EmptyDescription>Add songs to this playlist first.</EmptyDescription>
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
                    initialKey={shiftKey(keyFor(sid), transposeOffset)}
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
          <Toggle
            variant="outline"
            pressed={showChords}
            onPressedChange={setShowChords}
            aria-label="Show chords"
            className="pointer-events-auto bg-background/95 shadow-lg backdrop-blur"
          >
            Chords
          </Toggle>
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
