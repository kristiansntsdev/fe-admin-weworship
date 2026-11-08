"use client";

import { use } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

import { SongPager } from "../../../../_components/song-pager";
import { errorMessage, qk } from "../../../../_lib/api";
import { getPlaylist } from "../../../../_lib/playlists";

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

  const playlistQuery = useQuery({ queryKey: qk.playlist(playlistId), queryFn: () => getPlaylist(playlistId) });
  const playlist = playlistQuery.data;

  return (
    <SongPager
      songIds={playlist?.songs ?? []}
      // Songs open in the key set for this playlist, falling back to the song's own key.
      keyFor={(sid, song) => playlist?.song_keys?.[String(sid)] ?? song?.base_chord ?? null}
      title={playlist?.playlist_name ?? "Play"}
      backHref={`/prototype/playlists/${playlistId}`}
      startIndex={Math.max(0, Number(startParam) || 0)}
      pending={playlistQuery.isPending}
      unavailable={
        playlistQuery.isError || !playlist ? (
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
        ) : undefined
      }
      emptyDescription="Add songs to this playlist first."
    />
  );
}
