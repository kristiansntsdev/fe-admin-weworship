"use client";

import { use, useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { useQueries, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../../../_components/page-header";
import { SongDetailView } from "../../../../_components/song-detail-view";
import { errorMessage, qk } from "../../../../_lib/api";
import { getPlaylist } from "../../../../_lib/playlists";
import { getSong } from "../../../../_lib/songs";
import type { Song } from "../../../../_lib/types";

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

  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(Math.min(startIndex, Math.max(songIds.length - 1, 0)));
  const [showChords, setShowChords] = useState(true);

  const onSelect = useCallback((embla: NonNullable<CarouselApi>) => {
    setIndex(embla.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Jump to ?i= once songs are known (Embla may init before the list is ready).
  useEffect(() => {
    if (!api || songIds.length === 0) return;
    const target = Math.min(startIndex, songIds.length - 1);
    if (api.selectedScrollSnap() !== target) api.scrollTo(target, true);
  }, [api, songIds.length, startIndex]);

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
                onClick={() => api?.scrollPrev()}
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
                onClick={() => api?.scrollNext()}
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
        <Carousel setApi={setApi} opts={{ align: "start", containScroll: "trimSnaps" }} className="w-full">
          <CarouselContent className="-ml-0">
            {songIds.map((sid, i) => {
              const song = songsById.get(sid);
              const failed = songQueries[i]?.isError;
              return (
                <CarouselItem key={sid} className="pl-0">
                  <div className="max-h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto overscroll-y-contain">
                    {song ? (
                      <SongDetailView
                        song={song}
                        initialKey={keyFor(sid)}
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
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      )}
    </>
  );
}
