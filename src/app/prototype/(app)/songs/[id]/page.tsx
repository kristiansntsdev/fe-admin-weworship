"use client";

import { use, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListPlus, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { AddToPlaylistSheet } from "../../../_components/add-to-playlist-sheet";
import { PageHeader } from "../../../_components/page-header";
import { SongDetailView } from "../../../_components/song-detail-view";
import { toggleFavorite } from "../../../_lib/activity";
import { errorMessage, qk } from "../../../_lib/api";
import { keyRoot } from "../../../_lib/chordpro";
import { getSong } from "../../../_lib/songs";
import type { Song } from "../../../_lib/types";

export default function SongDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string; from?: string }>;
}) {
  const { id } = use(params);
  const { key: playlistKey, from } = use(searchParams);
  const songId = Number(id);
  const queryClient = useQueryClient();

  const songQuery = useQuery({ queryKey: qk.song(songId), queryFn: () => getSong(songId) });
  const song = songQuery.data;

  const [showChords, setShowChords] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(keyRoot(playlistKey));
  const backHref = from?.startsWith("/prototype") ? from : "/prototype/songs";

  const star = useMutation({
    mutationFn: () => toggleFavorite(songId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: qk.song(songId) });
      const prev = queryClient.getQueryData<Song>(qk.song(songId));
      if (prev) {
        queryClient.setQueryData<Song>(qk.song(songId), {
          ...prev,
          is_favorite: !prev.is_favorite,
        });
      }
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk.song(songId), ctx.prev);
      toast.error(errorMessage(err));
    },
    onSuccess: (res) => {
      queryClient.setQueryData<Song>(qk.song(songId), (prev) =>
        prev ? { ...prev, is_favorite: res.is_favorite } : prev,
      );
      queryClient.invalidateQueries({ queryKey: qk.favorites });
    },
  });

  const favorited = !!song?.is_favorite;

  return (
    <>
      <PageHeader
        title={song?.title ?? "Song"}
        backHref={backHref}
        actions={
          song && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={favorited}
                disabled={star.isPending}
                onClick={() => star.mutate()}
              >
                <Star className={cn(favorited && "fill-amber-400 text-amber-400")} />
              </Button>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <ListPlus />
                Add
              </Button>
            </div>
          )
        }
      />

      {songQuery.isPending ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : songQuery.isError || !song ? (
        <p className="p-4 text-destructive text-sm">{errorMessage(songQuery.error)}</p>
      ) : (
        <SongDetailView
          song={song}
          initialKey={playlistKey}
          showChords={showChords}
          onShowChordsChange={setShowChords}
          onCurrentKeyChange={setCurrentKey}
        />
      )}

      {song && (
        <AddToPlaylistSheet
          // Remount when the key changes (only possible while closed) so the sheet starts in the key being viewed.
          key={`${song.id}-${currentKey}`}
          song={song}
          defaultKey={currentKey ?? undefined}
          open={addOpen}
          onOpenChange={setAddOpen}
        />
      )}
    </>
  );
}
