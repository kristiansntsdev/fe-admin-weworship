"use client";

import { use, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Music, Play, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { AddSongsSheet } from "../../../_components/add-songs-sheet";
import { ConfirmDialog } from "../../../_components/confirm-dialog";
import { PageHeader } from "../../../_components/page-header";
import { PlaylistActions } from "../../../_components/playlist-actions";
import { ReorderList } from "../../../_components/reorder-list";
import { errorMessage, qk } from "../../../_lib/api";
import { getPlaylist, removeSong, reorderSongs } from "../../../_lib/playlists";
import { artistLabel, getSong } from "../../../_lib/songs";
import type { PlaylistDetail, Song } from "../../../_lib/types";

const ACCESS_LABEL = { owner: "Owner", leader: "Leader", "co-lead": "Co-lead", member: "Member" } as const;

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const playlistId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const playlistQuery = useQuery({ queryKey: qk.playlist(playlistId), queryFn: () => getPlaylist(playlistId) });
  const playlist = playlistQuery.data;
  const songIds = playlist?.songs ?? [];

  // The playlist only carries song ids — fetch each song (cached across playlists).
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

  const [draftOrder, setDraftOrder] = useState<number[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => reorderSongs(playlistId, ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: qk.playlist(playlistId) });
      const prev = queryClient.getQueryData<PlaylistDetail>(qk.playlist(playlistId));
      queryClient.setQueryData<PlaylistDetail>(qk.playlist(playlistId), (p) => (p ? { ...p, songs: ids } : p));
      setDraftOrder(null);
      return { prev };
    },
    onError: (err, _ids, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk.playlist(playlistId), ctx.prev);
      toast.error(errorMessage(err));
    },
    onSuccess: () => toast.success("Order saved"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.playlist(playlistId) }),
  });

  const removeMutation = useMutation({
    mutationFn: (songId: number) => removeSong(playlistId, songId),
    onSuccess: () => {
      setRemoveId(null);
      toast.success("Song removed");
      queryClient.invalidateQueries({ queryKey: qk.playlist(playlistId) });
      queryClient.invalidateQueries({ queryKey: qk.playlists });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  function saveOrder() {
    if (!draftOrder) return;
    // The API drops any id missing from the list — append anything added since reorder mode started.
    const full = [...draftOrder, ...songIds.filter((sid) => !draftOrder.includes(sid))];
    reorderMutation.mutate(full);
  }

  const isOwner = playlist?.access_type === "owner";
  const removeSongTitle = removeId !== null ? songsById.get(removeId)?.title : undefined;
  const playHref = `/prototype/playlists/${playlistId}/play`;

  return (
    <>
      <PageHeader
        title={playlist?.playlist_name ?? "Playlist"}
        backHref="/prototype/playlists"
        actions={
          playlist &&
          isOwner && <PlaylistActions playlist={playlist} onDeleted={() => router.replace("/prototype/playlists")} />
        }
      />

      {playlistQuery.isPending ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
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
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
            <p className="text-muted-foreground text-sm">
              {songIds.length} song{songIds.length === 1 ? "" : "s"}
              {!isOwner && ` · ${ACCESS_LABEL[playlist.access_type]}`}
            </p>
            {draftOrder ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDraftOrder(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveOrder}>
                  Save order
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                {songIds.length > 0 ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={playHref}>
                      <Play />
                      Play
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <Play />
                    Play
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={songIds.length < 2 || reorderMutation.isPending}
                  onClick={() => setDraftOrder(songIds)}
                >
                  <ArrowUpDown />
                  Reorder
                </Button>
                <Button size="sm" onClick={() => setAddOpen(true)}>
                  <Plus />
                  Add songs
                </Button>
              </div>
            )}
          </div>

          {draftOrder ? (
            <>
              <p className="px-4 pt-3 pb-1 text-muted-foreground text-xs">Drag the handles to reorder, then save.</p>
              <ReorderList
                items={draftOrder.map((sid) => {
                  const song = songsById.get(sid);
                  return {
                    id: sid,
                    title: song?.title ?? "Loading…",
                    subtitle: song ? artistLabel(song.artist) : undefined,
                    songKey: keyFor(sid),
                  };
                })}
                onReorder={setDraftOrder}
              />
            </>
          ) : songIds.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Music />
                </EmptyMedia>
                <EmptyTitle>No songs yet</EmptyTitle>
                <EmptyDescription>Add songs from the catalog to build your set list.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setAddOpen(true)}>
                  <Plus />
                  Add songs
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ul className="divide-y">
              {songIds.map((sid, i) => {
                const song = songsById.get(sid);
                const failed = songQueries[i]?.isError;
                const key = keyFor(sid);
                const href = `${playHref}?i=${i}`;
                return (
                  <li key={sid} className="flex items-center gap-1 pr-2">
                    <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4">
                      <span className="w-5 shrink-0 text-right text-muted-foreground text-sm tabular-nums">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        {song ? (
                          <>
                            <span className="block truncate font-medium">{song.title}</span>
                            <span className="block truncate text-muted-foreground text-sm">
                              {artistLabel(song.artist)}
                            </span>
                          </>
                        ) : failed ? (
                          <span className="text-muted-foreground text-sm">Song unavailable</span>
                        ) : (
                          <span className="block space-y-1.5">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/3" />
                          </span>
                        )}
                      </span>
                      {key && (
                        <Badge variant="outline" className="shrink-0 font-mono">
                          {key}
                        </Badge>
                      )}
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemoveId(sid)}
                      aria-label={`Remove ${song?.title ?? "song"}`}
                    >
                      <X />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          <AddSongsSheet playlistId={playlistId} existingIds={songIds} open={addOpen} onOpenChange={setAddOpen} />
        </>
      )}

      <ConfirmDialog
        open={removeId !== null}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="Remove song?"
        description={`“${removeSongTitle ?? "This song"}” will be removed from this playlist.`}
        confirmLabel="Remove"
        pending={removeMutation.isPending}
        onConfirm={() => removeId !== null && removeMutation.mutate(removeId)}
      />
    </>
  );
}
