"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { errorMessage, qk } from "../_lib/api";
import { useSongFilters } from "../_lib/song-filters";
import { getArtists, getSongKeys } from "../_lib/songs";

// Multi-select key and artist filters. Changes apply immediately; the list behind updates live.
export function SongFilterSheet({
  open,
  onOpenChange,
  total,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total?: number;
}) {
  const { keys, artists, toggleKey, toggleArtist, clearFilters } = useSongFilters();
  const [artistFilter, setArtistFilter] = useState("");

  const keysQuery = useQuery({ queryKey: qk.songKeys, queryFn: getSongKeys, enabled: open, staleTime: 5 * 60_000 });
  const artistsQuery = useQuery({ queryKey: qk.artists, queryFn: getArtists, enabled: open, staleTime: 5 * 60_000 });

  // Selected artists first, then the rest filtered by the search box.
  const needle = artistFilter.trim().toLowerCase();
  const allArtists = artistsQuery.data ?? [];
  const selectedArtists = allArtists.filter((a) => artists.includes(a.name));
  const otherArtists = allArtists.filter((a) => !artists.includes(a.name) && a.name.toLowerCase().includes(needle));
  const activeCount = keys.length + artists.length;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex min-h-0 w-full max-w-md flex-col">
          <DrawerHeader className="text-left">
            <DrawerTitle>Filter songs</DrawerTitle>
            <DrawerDescription>Pick any number of keys and artists.</DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4">
            <section className="space-y-2">
              <h3 className="font-medium text-sm">Key</h3>
              {keysQuery.isPending ? (
                <Skeleton className="h-9 w-full" />
              ) : keysQuery.isError ? (
                <p className="text-destructive text-sm">{errorMessage(keysQuery.error)}</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(keysQuery.data ?? []).map(({ key, count }) => {
                    const active = keys.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleKey(key)}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 font-medium text-sm transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-background hover:bg-accent",
                        )}
                      >
                        {key}
                        <span className={cn("text-xs", active ? "opacity-80" : "text-muted-foreground")}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="space-y-2 pb-2">
              <h3 className="font-medium text-sm">Artist</h3>
              <Input
                type="search"
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
                placeholder="Find an artist"
                aria-label="Find an artist"
              />
              {artistsQuery.isPending ? (
                <div className="space-y-2 pt-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ) : artistsQuery.isError ? (
                <p className="text-destructive text-sm">{errorMessage(artistsQuery.error)}</p>
              ) : (
                <ul className="divide-y rounded-md border">
                  {[...selectedArtists, ...otherArtists].map((a) => {
                    const checked = artists.includes(a.name);
                    return (
                      <li key={a.name}>
                        <button
                          type="button"
                          aria-pressed={checked}
                          onClick={() => toggleArtist(a.name)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded border",
                              checked && "border-primary bg-primary text-primary-foreground",
                            )}
                          >
                            {checked && <Check className="size-3.5" />}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm">{a.name}</span>
                          <span className="text-muted-foreground text-xs">{a.count}</span>
                        </button>
                      </li>
                    );
                  })}
                  {selectedArtists.length + otherArtists.length === 0 && (
                    <li className="p-3 text-muted-foreground text-sm">No artists match “{artistFilter}”.</li>
                  )}
                </ul>
              )}
            </section>
          </div>

          <DrawerFooter className="flex-row">
            <Button variant="outline" onClick={clearFilters} disabled={activeCount === 0}>
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              {total === undefined ? "Show songs" : `Show ${total} song${total === 1 ? "" : "s"}`}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
