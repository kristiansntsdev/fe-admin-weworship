"use client";

import { use, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { ListPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import { AddToPlaylistSheet } from "../../../_components/add-to-playlist-sheet";
import { KeyPicker } from "../../../_components/key-picker";
import { Lyrics } from "../../../_components/lyrics";
import { PageHeader } from "../../../_components/page-header";
import { errorMessage, qk } from "../../../_lib/api";
import { keyRoot } from "../../../_lib/chordpro";
import { artistLabel, getSong } from "../../../_lib/songs";

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

  const originalKey = keyRoot(song?.base_chord);
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  // Opened from a playlist → start in that playlist's key, otherwise the song's own key.
  const currentKey = pickedKey ?? keyRoot(playlistKey) ?? originalKey;

  const [showChords, setShowChords] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <p className="text-muted-foreground">{artistLabel(song.artist) || "Unknown artist"}</p>
            <div className="flex flex-wrap gap-1.5">
              {song.base_chord && <Badge variant="outline">Original key {song.base_chord}</Badge>}
              {song.bpm ? <Badge variant="outline">{song.bpm} BPM</Badge> : null}
              {song.tags?.map((t) => (
                <Badge key={t.id} variant="secondary">
                  {t.name}
                </Badge>
              ))}
            </div>
            <ListenLinks
              links={[
                ["Spotify", song.spotify_url],
                ["YouTube", song.youtube_url],
                ["Apple Music", song.apple_music_url],
              ]}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{currentKey ? `Key of ${currentKey}` : "Key unknown"}</p>
              <div className="flex items-center gap-2">
                <Switch id="show-chords" checked={showChords} onCheckedChange={setShowChords} />
                <Label htmlFor="show-chords" className="text-sm">
                  Chords
                </Label>
              </div>
            </div>
            {currentKey && <KeyPicker value={currentKey} onChange={setPickedKey} originalKey={originalKey} />}
          </div>

          <Lyrics
            source={song.lyrics_and_chords ?? ""}
            fromKey={originalKey}
            toKey={currentKey}
            showChords={showChords}
          />
        </div>
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

function ListenLinks({ links }: { links: [label: string, url: string | null][] }) {
  const available = links.filter(([, url]) => url);
  if (available.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {available.map(([label, url]) => (
        <Button key={label} variant="outline" size="xs" asChild>
          <a href={url ?? undefined} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        </Button>
      ))}
    </div>
  );
}
