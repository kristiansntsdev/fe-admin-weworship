"use client";

import { useState } from "react";

import Link from "next/link";

import { MessageSquarePlus, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { AddToPlaylistSheet } from "../../_components/add-to-playlist-sheet";
import { PageHeader } from "../../_components/page-header";
import { SongRow } from "../../_components/song-row";
import { errorMessage } from "../../_lib/api";
import type { Song } from "../../_lib/types";
import { useDebouncedValue } from "../../_lib/use-debounced-value";
import { useSongSearch } from "../../_lib/use-song-search";

export default function SongsPage() {
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query, 300);
  const [addSong, setAddSong] = useState<Song | null>(null);

  const { songs, total, isPending, isError, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSongSearch(search);

  return (
    <>
      <PageHeader title="Songs">
        <div className="relative">
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, artist or lyrics"
            aria-label="Search songs"
            className="pl-9"
          />
        </div>
      </PageHeader>

      {isPending ? (
        <div className="space-y-4 p-4">
          {Array.from({ length: 8 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="p-4 text-destructive text-sm">{errorMessage(error)}</p>
      ) : songs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Song not found</EmptyTitle>
            <EmptyDescription>
              {search ? `Nothing matches “${search}”.` : "The catalog is empty."} Ask us to add it.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href={`/prototype/requests/new${search ? `?title=${encodeURIComponent(search)}` : ""}`}>
                <MessageSquarePlus />
                Request this song
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {total !== undefined && (
            <p className="px-4 pt-3 text-muted-foreground text-xs">
              {total} song{total === 1 ? "" : "s"}
            </p>
          )}
          <ul className="divide-y">
            {songs.map((song) => (
              <SongRow
                key={song.id}
                song={song}
                href={`/prototype/songs/${song.id}`}
                action={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAddSong(song)}
                    aria-label={`Add ${song.title} to playlist`}
                  >
                    <Plus />
                  </Button>
                }
              />
            ))}
          </ul>
          {hasNextPage && (
            <div className="p-4 text-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}

      {addSong && (
        <AddToPlaylistSheet key={addSong.id} song={addSong} open onOpenChange={(open) => !open && setAddSong(null)} />
      )}
    </>
  );
}
