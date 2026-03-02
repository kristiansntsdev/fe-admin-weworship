"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Song } from "../page";

const CHORD_KEYS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];
const LINK_PROVIDERS = ["Spotify", "Youtube", "Apple Music"] as const;
type LinkProvider = typeof LINK_PROVIDERS[number];

// Returns true if this line has chords but no lyric text.
// After stripping [chord] tokens and slash separators between them, only whitespace should remain.
function isChordOnlyLine(line: string): boolean {
  const stripped = line
    .replace(/\[[^\]]+\]/g, "") // remove [chord] tokens
    .replace(/\//g, "")         // remove slash separators (e.g. B/F# leaves behind /)
    .trim();
  return stripped.length === 0 && /\[[^\]]+\]/.test(line);
}

// Build a character-position array from a chord line (extension module 5 algorithm).
// Strip brackets first so "  [C]     [G]" → "  C     G", then split by space.
// Each non-empty token T gets one slot for the chord name + T.length empty slots.
// Each space gets one empty slot.
function buildChordArray(chordLine: string): string[] {
  const raw = chordLine.replace(/\[([^\]]+)\]/g, "$1"); // strip brackets
  const c: string[] = [];
  raw.split(" ").forEach((token) => {
    if (token.length > 0) {
      c.push(token); // chord name occupies this slot
      for (let k = 0; k < token.length; k++) c.push(""); // extra slots for chord width
    } else {
      c.push(""); // space becomes empty slot
    }
  });
  return c;
}

// Merge chord array with lyric chars, exactly like the extension:
// for each position: if chord[i] is non-empty prepend [chord], then append lyric[i]
function mergeChordWithLyric(chordLine: string, lyricLine: string): string {
  const c = buildChordArray(chordLine);
  const lyric = lyricLine.split("");

  const len = Math.max(c.length, lyric.length);
  // Pad lyric with spaces if chord line is longer
  while (lyric.length < c.length) lyric.push(" ");

  let result = "";
  for (let i = 0; i < len; i++) {
    if (c[i]) result += `[${c[i]}]`;
    if (lyric[i]) result += lyric[i];
  }
  return result.trimEnd();
}

// Post-process: merge consecutive (chord-only, lyric) line pairs
function mergeChordLines(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isChordOnlyLine(line) && i + 1 < lines.length && !isChordOnlyLine(lines[i + 1])) {
      out.push(mergeChordWithLyric(line, lines[i + 1]));
      i += 2;
    } else {
      out.push(line);
      i++;
    }
  }
  return out.join("\n");
}

function htmlToChordPro(html: string): string {
  const text = html
    // Inline chord spans → [chord]
    .replace(/<span class="c"[^>]*>([^<]*)<\/span>/g, "[$1]")
    // Slash between chords (e.g. C/E)
    .replace(/<span class="on"[^>]*>([^<]*)<\/span>/g, "$1")
    // Merge adjacent chord brackets with slash: [B]/[F#] → [B/F#]
    .replace(/\[([^\]]+)\]\/\[([^\]]+)\]/g, "[$1/$2]")
    // Block-level newlines
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(div|p|pre)[^>]*>/gi, "\n")
    // Strip remaining tags
    .replace(/<[^>]+>/g, "")
    // HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    // Collapse 3+ blank lines → 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return mergeChordLines(text);
}

interface Props {
  song?: Song;
}

export function SongFormPage({ song }: Props) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(song?.title ?? "");
  const [artists, setArtists] = useState<string[]>(
    song?.artist ? String(song.artist).split(",").map((a) => a.trim()).filter(Boolean) : []
  );
  const [artistInput, setArtistInput] = useState("");
  const [baseChord, setBaseChord] = useState(song?.base_chord ?? "");
  const [bpm, setBpm] = useState<string>(song?.bpm != null ? String(song.bpm) : "");
  const [chordPro, setChordPro] = useState(song?.lyrics_and_chords ?? "");
  const [links, setLinks] = useState<{ provider: LinkProvider; url: string }[]>(() => {
    try {
      const raw = song?.external_links;
      if (!raw) return [];
      const str = typeof raw === "object" && raw !== null && "String" in raw
        ? (raw as { String: string; Valid: boolean }).Valid ? (raw as { String: string }).String : ""
        : typeof raw === "string" ? raw : "";
      if (!str) return [];
      const parsed = JSON.parse(str) as Record<string, string>;
      return Object.entries(parsed)
        .filter(([p]) => LINK_PROVIDERS.includes(p as LinkProvider))
        .map(([provider, url]) => ({ provider: provider as LinkProvider, url }));
    } catch { return []; }
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editorRef.current && song?.lyrics_and_chords) {
      editorRef.current.innerHTML = song.lyrics_and_chords;
    }
  }, [song?.lyrics_and_chords]);

  function addArtist() {
    const name = artistInput.trim();
    if (name && !artists.includes(name)) {
      setArtists((prev) => [...prev, name]);
    }
    setArtistInput("");
  }

  function removeArtist(name: string) {
    setArtists((prev) => prev.filter((a) => a !== name));
  }

  function handleConvertChordPro() {
    const html = editorRef.current?.innerHTML ?? "";
    setChordPro(htmlToChordPro(html));
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Title is required"); return; }
    if (artists.length === 0) { setError("At least one artist is required"); return; }
    if (!chordPro.trim()) { setError("Lyrics/chords are required"); return; }
    setError("");
    setSubmitting(true);

    const body = {
      title: title.trim(),
      artist: artists.join(", "),
      base_chord: baseChord,
      bpm: bpm !== "" ? Number(bpm) : null,
      lyrics_and_chords: chordPro,
      external_links: JSON.stringify(
        Object.fromEntries(links.filter((l) => l.provider.trim() && l.url.trim()).map((l) => [l.provider.trim(), l.url.trim()]))
      ),
    };

    const method = song ? "PUT" : "POST";
    const path = song ? `/api/admin/songs/${song.id}` : "/api/admin/songs";

    try {
      const res = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        setError(err.message ?? "Failed to save song");
        return;
      }
      router.push("/dashboard/songs");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Row 1: Title + Artist */}
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <Input
            placeholder="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex gap-2">
            <Input
              placeholder="artist"
              value={artistInput}
              onChange={(e) => setArtistInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArtist(); } }}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={addArtist}>
              add
            </Button>
          </div>
          {artists.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {artists.map((a) => (
                <Badge key={a} variant="secondary" className="gap-1 pr-1">
                  {a}
                  <button
                    type="button"
                    onClick={() => removeArtist(a)}
                    className="rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Base chord + BPM + Convert button */}
      <div className="flex items-center gap-3">
        <Select value={baseChord} onValueChange={setBaseChord}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="base chord" />
          </SelectTrigger>
          <SelectContent>
            {CHORD_KEYS.map((k) => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="BPM"
          value={bpm}
          onChange={(e) => setBpm(e.target.value)}
          min={1}
          max={300}
          className="w-24"
        />
        <div className="flex-1" />
        <Button type="button" variant="outline" size="sm" onClick={handleConvertChordPro}>
          convert chordpro
        </Button>
      </div>

      {/* Row 3: WYSIWYG + ChordPro panels */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: WYSIWYG editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[420px] rounded-md border bg-background p-3 font-mono text-sm overflow-auto focus:outline-none focus-visible:ring-1 focus-visible:ring-ring [&_.c]:text-blue-500 [&_.c]:font-semibold"
          data-placeholder="Paste lyrics and chords here..."
        />
        {/* Right: ChordPro output (editable) */}
        <Textarea
          value={chordPro}
          onChange={(e) => setChordPro(e.target.value)}
          placeholder="ChordPro output will appear here after clicking 'convert chordpro', or type directly"
          className="min-h-[420px] font-mono text-sm resize-none"
        />
      </div>

      {/* External links */}
      <div className="flex flex-col gap-2">
        {links.map((link, i) => {
          const usedProviders = links.map((l, idx) => idx !== i ? l.provider : null).filter(Boolean);
          const availableProviders = LINK_PROVIDERS.filter((p) => !usedProviders.includes(p));
          return (
            <div key={i} className="flex gap-2 items-center">
              <Select
                value={link.provider}
                onValueChange={(v) => setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, provider: v as LinkProvider } : l))}
              >
                <SelectTrigger className="w-36 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LINK_PROVIDERS.filter((p) => p === link.provider || !usedProviders.includes(p)).map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={
                  link.provider === "Spotify" ? "https://open.spotify.com/track/..." :
                  link.provider === "Youtube" ? "https://www.youtube.com/watch?v=..." :
                  "https://music.apple.com/..."
                }
                value={link.url}
                onChange={(e) => setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, url: e.target.value } : l))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <X className="size-4" />
              </Button>
            </div>
          );
        })}
        {links.length < LINK_PROVIDERS.length && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => {
              const used = links.map((l) => l.provider);
              const next = LINK_PROVIDERS.find((p) => !used.includes(p));
              if (next) setLinks((prev) => [...prev, { provider: next, url: "" }]);
            }}
          >
            + add link
          </Button>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {/* Submit row */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "submit"}
        </Button>
      </div>
    </div>
  );
}
