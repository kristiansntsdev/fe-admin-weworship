"use client";

import { useState } from "react";

import Link from "next/link";

import { ArrowUpDown, MessageSquarePlus, Plus, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { AddToPlaylistSheet } from "../../_components/add-to-playlist-sheet";
import { PageHeader } from "../../_components/page-header";
import { SongFilterSheet } from "../../_components/song-filter-sheet";
import { SongRow } from "../../_components/song-row";
import { errorMessage } from "../../_lib/api";
import { useSongFilters } from "../../_lib/song-filters";
import { SONG_SORTS } from "../../_lib/songs";
import type { Song, SongSort } from "../../_lib/types";
import { useDebouncedValue } from "../../_lib/use-debounced-value";
import { useSongSearch } from "../../_lib/use-song-search";

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter ${label}`}
      className="inline-flex h-7 max-w-48 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 font-medium text-primary text-xs"
    >
      <span className="truncate">{label}</span>
      <X className="size-3 shrink-0" />
    </button>
  );
}

export default function SongsPage() {
  const { query, sort, keys, artists, setQuery, setSort, toggleKey, toggleArtist, clearFilters } = useSongFilters();
  const search = useDebouncedValue(query, 300);
  const [addSong, setAddSong] = useState<Song | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = keys.length + artists.length;

  const { songs, total, isPending, isError, error, isPlaceholderData, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSongSearch({ search, sort, keys, artists });

  return (
    <>
      <PageHeader title="Songs">
        <div className="flex gap-2">
          <div className="relative flex-1">
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
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setFiltersOpen(true)}
            aria-label={activeCount ? `Filters (${activeCount} active)` : "Filters"}
          >
            <SlidersHorizontal />
            {activeCount > 0 && (
              <span className="-top-1.5 -right-1.5 absolute flex size-5 items-center justify-center rounded-full bg-primary font-semibold text-[10px] text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </div>
        {activeCount > 0 && (
          <div className="-mx-4 mt-2 flex items-center gap-1.5 overflow-x-auto px-4">
            {keys.map((k) => (
              <FilterChip key={`key-${k}`} label={`Key ${k}`} onRemove={() => toggleKey(k)} />
            ))}
            {artists.map((a) => (
              <FilterChip key={`artist-${a}`} label={a} onRemove={() => toggleArtist(a)} />
            ))}
            <Button variant="ghost" size="xs" className="shrink-0" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <p className="text-muted-foreground text-xs">
          {total === undefined ? " " : `${total} song${total === 1 ? "" : "s"}`}
        </p>
        <Select value={sort} onValueChange={(v) => setSort(v as SongSort)}>
          <SelectTrigger size="sm" className="text-xs" aria-label="Sort songs">
            <ArrowUpDown className="size-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {Object.entries(SONG_SORTS)
              .filter(([value]) => value !== "relevance" || query.trim() !== "")
              .map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

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
            <EmptyTitle>{activeCount ? "No songs match these filters" : "Song not found"}</EmptyTitle>
            <EmptyDescription>
              {activeCount
                ? "Try removing a key or artist filter."
                : `${search ? `Nothing matches “${search}”.` : "The catalog is empty."} Ask us to add it.`}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {activeCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
            {(search || !activeCount) && (
              <Button asChild>
                <Link href={`/prototype/requests/new${search ? `?title=${encodeURIComponent(search)}` : ""}`}>
                  <MessageSquarePlus />
                  Request this song
                </Link>
              </Button>
            )}
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <ul className={cn("divide-y transition-opacity", isPlaceholderData && "opacity-60")}>
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

      <SongFilterSheet open={filtersOpen} onOpenChange={setFiltersOpen} total={total} />

      {addSong && (
        <AddToPlaylistSheet key={addSong.id} song={addSong} open onOpenChange={(open) => !open && setAddSong(null)} />
      )}
    </>
  );
}
