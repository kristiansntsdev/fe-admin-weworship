"use client";

import { useState } from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { Lyrics } from "../../prototype/_components/lyrics";
import { LyricsChordSwitcher } from "../../prototype/_components/lyrics-chord-switcher";
import { VerifiedBadge } from "../../prototype/_components/verified-badge";
import { keyRoot } from "../../prototype/_lib/chordpro";
import { artistLabel } from "../../prototype/_lib/songs";
import type { PublishedPlaylist } from "../../prototype/_lib/types";

// Read-only page for a published playlist. Lyrics-only playlists arrive without chords (stripped on the server), so
// the chords switcher only exists when the owner published with chords.
export function PublishedPlaylistView({ playlist }: { playlist: PublishedPlaylist }) {
  const canShowChords = playlist.view_mode === "lyrics_chords";
  const [showChords, setShowChords] = useState(true);
  const { owner, songs } = playlist;

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold text-lg leading-tight">{playlist.playlist_name}</h1>
            <p className="flex min-w-0 items-center gap-1 text-muted-foreground text-xs">
              <span className="shrink-0">
                {playlist.song_count} song{playlist.song_count === 1 ? "" : "s"}
              </span>
              {owner && (
                <>
                  <span>·</span>
                  <span className="truncate">@{owner.username}</span>
                  {owner.verified && <VerifiedBadge size="sm" />}
                </>
              )}
            </p>
          </div>
          {canShowChords && <LyricsChordSwitcher showChords={showChords} onShowChordsChange={setShowChords} />}
        </div>
      </header>

      {songs.length === 0 ? (
        <p className="p-6 text-center text-muted-foreground text-sm">This playlist doesn't have any songs yet.</p>
      ) : (
        <ol className="divide-y">
          {songs.map((song, i) => (
            <li key={song.id} className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <span className="w-5 shrink-0 pt-0.5 text-right text-muted-foreground text-sm tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{song.title}</h2>
                  <p className="text-muted-foreground text-sm">{artistLabel(song.artist) || "Unknown artist"}</p>
                </div>
                {song.key && (
                  <Badge variant="outline" className="shrink-0 font-mono">
                    {song.key}
                  </Badge>
                )}
              </div>
              {song.unavailable ? (
                <p className="text-muted-foreground text-sm">Lyrics unavailable.</p>
              ) : (
                <Lyrics
                  source={song.lyrics_and_chords ?? ""}
                  fromKey={keyRoot(song.original_key)}
                  toKey={keyRoot(song.key)}
                  showChords={canShowChords && showChords}
                />
              )}
            </li>
          ))}
        </ol>
      )}

      <footer className="mt-auto border-t p-4 text-center text-muted-foreground text-xs">
        <Link href="/prototype" className="font-medium text-primary hover:underline">
          WeWorship
        </Link>
        {" · worship songs and playlists"}
      </footer>
    </>
  );
}
