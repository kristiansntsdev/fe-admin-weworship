"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Song } from "../page";
import { DeleteSongDialog } from "./delete-song-dialog";
import { SongsTable } from "./songs-table";

interface Props {
  songs: Song[];
  total: number;
  limit: number;
  currentPage: number;
  currentSearch: string;
  currentHasLink: string;
  currentChordPro: string;
  currentSortBy: string;
  currentSortOrder: string;
  currentBaseChord: string;
}

export function SongsClient({ songs, total, limit, currentPage, currentSearch, currentHasLink, currentChordPro, currentSortBy, currentSortOrder, currentBaseChord }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [deleteSong, setDeleteSong] = useState<Song | null>(null);

  function buildParams(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    const merged = { search, has_link: currentHasLink, chordpro: currentChordPro, sortBy: currentSortBy, sortOrder: currentSortOrder, base_chord: currentBaseChord, page: "1", ...overrides };
    if (merged.search) p.set("search", merged.search);
    if (merged.has_link && merged.has_link !== "all") p.set("has_link", merged.has_link);
    if (merged.chordpro && merged.chordpro !== "all") p.set("chordpro", merged.chordpro);
    if (merged.base_chord) p.set("base_chord", merged.base_chord);
    if (merged.sortBy && merged.sortBy !== "createdAt") p.set("sortBy", merged.sortBy);
    if (merged.sortOrder && merged.sortOrder !== "DESC") p.set("sortOrder", merged.sortOrder);
    if (merged.page !== "1") p.set("page", merged.page);
    return p.toString().replace(/\+/g, "%20");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/dashboard/songs?${buildParams({ search, page: "1" })}`);
  }

  function handlePage(page: number) {
    router.push(`/dashboard/songs?${buildParams({ page: String(page) })}`);
  }

  function handleSort(col: string) {
    const newOrder = currentSortBy === col && currentSortOrder === "ASC" ? "DESC" : "ASC";
    router.push(`/dashboard/songs?${buildParams({ sortBy: col, sortOrder: newOrder, page: "1" })}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Input
                placeholder="Search title, artist, or lyrics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-52 pr-8"
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => { setSearch(""); router.push(`/dashboard/songs?${buildParams({ search: "", page: "1" })}`); }}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="outline" size="icon">
              <Search className="size-4" />
            </Button>
          </form>

          <Select
            value={currentHasLink}
            onValueChange={(v) => router.push(`/dashboard/songs?${buildParams({ has_link: v, page: "1" })}`)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All links</SelectItem>
              <SelectItem value="true">Has external link</SelectItem>
              <SelectItem value="false">No external link</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={currentChordPro}
            onValueChange={(v) => router.push(`/dashboard/songs?${buildParams({ chordpro: v, page: "1" })}`)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All formats</SelectItem>
              <SelectItem value="true">ChordPro ready</SelectItem>
              <SelectItem value="false">Not converted</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={currentBaseChord || "all"}
            onValueChange={(v) => router.push(`/dashboard/songs?${buildParams({ base_chord: v === "all" ? "" : v, page: "1" })}`)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All keys" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All keys</SelectItem>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="A#">A#</SelectItem>
              <SelectItem value="Bb">Bb</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="C#">C#</SelectItem>
              <SelectItem value="Db">Db</SelectItem>
              <SelectItem value="D">D</SelectItem>
              <SelectItem value="D#">D#</SelectItem>
              <SelectItem value="Eb">Eb</SelectItem>
              <SelectItem value="E">E</SelectItem>
              <SelectItem value="F">F</SelectItem>
              <SelectItem value="F#">F#</SelectItem>
              <SelectItem value="Gb">Gb</SelectItem>
              <SelectItem value="G">G</SelectItem>
              <SelectItem value="G#">G#</SelectItem>
              <SelectItem value="Ab">Ab</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button asChild>
          <Link href="/dashboard/songs/new">
            <Plus className="size-4" />
            Add Song
          </Link>
        </Button>
      </div>

      <SongsTable
        songs={songs}
        total={total}
        page={currentPage}
        limit={limit}
        sortBy={currentSortBy}
        sortOrder={currentSortOrder}
        onPageChange={handlePage}
        onSort={handleSort}
        onEdit={(song) => {
          const qs = buildParams({ page: String(currentPage) });
          const returnUrl = `/dashboard/songs${qs ? `?${qs}` : ""}`;
          router.push(`/dashboard/songs/${song.id}/edit?returnUrl=${encodeURIComponent(returnUrl)}`);
        }}
        onDelete={setDeleteSong}
      />

      <DeleteSongDialog
        open={!!deleteSong}
        onOpenChange={(open) => !open && setDeleteSong(null)}
        song={deleteSong}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

