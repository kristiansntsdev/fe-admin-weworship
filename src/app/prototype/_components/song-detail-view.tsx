"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { keyRoot } from "../_lib/chordpro";
import { artistLabel } from "../_lib/songs";
import type { Song } from "../_lib/types";
import { KeyPicker } from "./key-picker";
import { Lyrics } from "./lyrics";

export function SongDetailView({
  song,
  initialKey,
  showChords,
  onShowChordsChange,
  onCurrentKeyChange,
  /** Play mode: chords toggle + lyrics only (no meta / key picker). */
  variant = "full",
}: {
  song: Song;
  /** Playlist key (or other override) to open in — falls back to the song's own key. */
  initialKey?: string | null;
  showChords: boolean;
  onShowChordsChange: (v: boolean) => void;
  onCurrentKeyChange?: (key: string | null) => void;
  variant?: "full" | "play";
}) {
  const originalKey = keyRoot(song.base_chord);
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  // Play mode is controlled by initialKey (parent applies transpose); don't keep a local pick.
  const currentKey = variant === "play" ? (keyRoot(initialKey) ?? originalKey) : (pickedKey ?? keyRoot(initialKey) ?? originalKey);

  useEffect(() => {
    onCurrentKeyChange?.(currentKey);
  }, [currentKey, onCurrentKeyChange]);

  if (variant === "play") {
    return (
      <div className="space-y-4 p-4 pb-24">
        <div className="flex items-center justify-end gap-2">
          <Switch id={`show-chords-play-${song.id}`} checked={showChords} onCheckedChange={onShowChordsChange} />
          <Label htmlFor={`show-chords-play-${song.id}`} className="text-sm">
            Chords
          </Label>
        </div>
        <Lyrics
          source={song.lyrics_and_chords ?? ""}
          fromKey={originalKey}
          toKey={currentKey}
          showChords={showChords}
        />
      </div>
    );
  }

  return (
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
            <Switch id={`show-chords-${song.id}`} checked={showChords} onCheckedChange={onShowChordsChange} />
            <Label htmlFor={`show-chords-${song.id}`} className="text-sm">
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
