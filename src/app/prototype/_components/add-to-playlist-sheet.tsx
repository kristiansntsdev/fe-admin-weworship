"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { keyRoot } from "../_lib/chordpro";
import { addSongWithKey, canEditSongs, createPlaylist, listPlaylists } from "../_lib/playlists";
import type { Song } from "../_lib/types";
import { KeyPicker } from "./key-picker";

// Parent should key this by song id so the selection resets per song.
export function AddToPlaylistSheet({
  song,
  defaultKey,
  open,
  onOpenChange,
}: {
  song: Song;
  defaultKey?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [key, setKey] = useState(defaultKey ?? keyRoot(song.base_chord) ?? "G");
  const [newName, setNewName] = useState("");

  const playlistsQuery = useQuery({ queryKey: qk.playlists, queryFn: listPlaylists, enabled: open });

  // Setting a song's key needs owner / leader / co-lead rights, so plain members' playlists are hidden.
  const editable = (playlistsQuery.data ?? []).filter((p) => canEditSongs(p.access_type));
  const needle = filter.trim().toLowerCase();
  const playlists = editable.filter((p) => p.playlist_name.toLowerCase().includes(needle));
  const selected = editable.find((p) => p.id === selectedId);

  const createMutation = useMutation({
    mutationFn: (name: string) => createPlaylist(name),
    onSuccess: async (pl) => {
      setNewName("");
      setFilter("");
      await queryClient.invalidateQueries({ queryKey: qk.playlists });
      setSelectedId(pl.id);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const addMutation = useMutation({
    mutationFn: (playlistId: number) => addSongWithKey(playlistId, song.id, key),
    onSuccess: (_, playlistId) => {
      toast.success(`Added to ${selected?.playlist_name ?? "playlist"} in ${key}`);
      queryClient.invalidateQueries({ queryKey: qk.playlists });
      queryClient.invalidateQueries({ queryKey: qk.playlist(playlistId) });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto flex min-h-0 w-full max-w-md flex-col">
          <DrawerHeader className="text-left">
            <DrawerTitle>Add to playlist</DrawerTitle>
            <DrawerDescription className="truncate">{song.title}</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 px-4">
            <Input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Find a playlist"
              aria-label="Find a playlist"
            />

            <ul className="max-h-[32dvh] divide-y overflow-y-auto rounded-md border">
              {playlistsQuery.isPending ? (
                <li className="space-y-2 p-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                </li>
              ) : playlists.length === 0 ? (
                <li className="p-3 text-muted-foreground text-sm">
                  {needle ? "No playlists match." : "No playlists yet — create one below."}
                </li>
              ) : (
                playlists.map((p) => {
                  const inPlaylist = p.songs?.includes(song.id);
                  const isSelected = p.id === selectedId;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent",
                          isSelected && "bg-primary/10",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{p.playlist_name}</span>
                          <span className="text-muted-foreground text-xs">{p.songs?.length ?? 0} songs</span>
                        </span>
                        {inPlaylist && <Badge variant="secondary">Added · updates key</Badge>}
                        {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (newName.trim()) createMutation.mutate(newName.trim());
              }}
            >
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New playlist name"
                aria-label="New playlist name"
              />
              <Button
                type="submit"
                variant="outline"
                size="icon"
                disabled={!newName.trim() || createMutation.isPending}
                aria-label="Create playlist"
              >
                <Plus />
              </Button>
            </form>

            <div className="space-y-1.5">
              <p className="font-medium text-sm">Key for this playlist</p>
              <KeyPicker value={key} onChange={setKey} originalKey={keyRoot(song.base_chord)} />
            </div>
          </div>

          <DrawerFooter>
            <Button
              disabled={selectedId === null || addMutation.isPending}
              onClick={() => selectedId !== null && addMutation.mutate(selectedId)}
            >
              {addMutation.isPending ? "Adding…" : selected ? `Add to ${selected.playlist_name}` : "Choose a playlist"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
