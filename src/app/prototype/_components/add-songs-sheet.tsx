"use client";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";

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
import { addSongs } from "../_lib/playlists";
import { artistLabel } from "../_lib/songs";
import { useDebouncedValue } from "../_lib/use-debounced-value";
import { useSongSearch } from "../_lib/use-song-search";

// Multi-select catalog search → appends the picked songs to the playlist (in their original keys).
export function AddSongsSheet({
  playlistId,
  existingIds,
  open,
  onOpenChange,
}: {
  playlistId: number;
  existingIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query, 300);
  const [selected, setSelected] = useState<number[]>([]);

  const { songs, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useSongSearch(search, open);

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  const addMutation = useMutation({
    mutationFn: () => addSongs(playlistId, selected),
    onSuccess: () => {
      toast.success(`Added ${selected.length} song${selected.length === 1 ? "" : "s"}`);
      setSelected([]);
      setQuery("");
      queryClient.invalidateQueries({ queryKey: qk.playlist(playlistId) });
      queryClient.invalidateQueries({ queryKey: qk.playlists });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex min-h-0 w-full max-w-md flex-col">
          <DrawerHeader className="text-left">
            <DrawerTitle>Add songs</DrawerTitle>
            <DrawerDescription>Pick one or more songs to append to this playlist.</DrawerDescription>
          </DrawerHeader>

          <div className="px-4">
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, artist or lyrics"
              aria-label="Search songs"
            />
          </div>

          <ul className="mt-3 max-h-[45dvh] divide-y overflow-y-auto border-y">
            {isPending ? (
              <li className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </li>
            ) : songs.length === 0 ? (
              <li className="p-4 text-muted-foreground text-sm">No songs found.</li>
            ) : (
              songs.map((song) => {
                const already = existingIds.includes(song.id);
                const checked = already || selected.includes(song.id);
                return (
                  <li key={song.id}>
                    <button
                      type="button"
                      disabled={already}
                      onClick={() => toggle(song.id)}
                      aria-pressed={checked}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent disabled:opacity-60"
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded border",
                          checked && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {checked && <Check className="size-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{song.title}</span>
                        <span className="block truncate text-muted-foreground text-xs">
                          {already ? "Already in playlist" : artistLabel(song.artist)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
            {hasNextPage && (
              <li className="p-2 text-center">
                <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </li>
            )}
          </ul>

          <DrawerFooter>
            <Button disabled={selected.length === 0 || addMutation.isPending} onClick={() => addMutation.mutate()}>
              {addMutation.isPending
                ? "Adding…"
                : selected.length
                  ? `Add ${selected.length} song${selected.length === 1 ? "" : "s"}`
                  : "Select songs"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
