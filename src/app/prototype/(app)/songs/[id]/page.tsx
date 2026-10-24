"use client";

import { use, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { ListPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { AddToPlaylistSheet } from "../../../_components/add-to-playlist-sheet";
import { PageHeader } from "../../../_components/page-header";
import { SongDetailView } from "../../../_components/song-detail-view";
import { errorMessage, qk } from "../../../_lib/api";
import { keyRoot } from "../../../_lib/chordpro";
import { getSong } from "../../../_lib/songs";

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

  const songQuery = useQuery({ queryKey: qk.song(songId), queryFn: () => getSong(songId) });
  const song = songQuery.data;

  const [showChords, setShowChords] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(keyRoot(playlistKey));
  const backHref = from?.startsWith("/prototype") ? from : "/prototype/songs";

  return (
    <>
      <PageHeader
        title={song?.title ?? "Song"}
        backHref={backHref}
        actions={
          song && (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <ListPlus />
              Add
            </Button>
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
