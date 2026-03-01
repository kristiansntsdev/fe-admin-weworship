"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Song } from "../page";
import { DeleteSongDialog } from "./delete-song-dialog";
import { SongDialog } from "./song-dialog";
import { SongsTable } from "./songs-table";

interface Props {
  songs: Song[];
  total: number;
  limit: number;
  currentPage: number;
  currentSearch: string;
}

export function SongsClient({ songs, total, limit, currentPage, currentSearch }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [createOpen, setCreateOpen] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSong, setDeleteSong] = useState<Song | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", "1");
    router.push(`/dashboard/songs?${params}`);
  }

  function handlePage(page: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    router.push(`/dashboard/songs?${params}`);
  }

  function onMutated() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="size-4" />
          </Button>
        </form>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Add Song
        </Button>
      </div>

      <SongsTable
        songs={songs}
        total={total}
        page={currentPage}
        limit={limit}
        onPageChange={handlePage}
        onEdit={setEditSong}
        onDelete={setDeleteSong}
      />

      <SongDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={onMutated}
      />

      <SongDialog
        open={!!editSong}
        onOpenChange={(open) => !open && setEditSong(null)}
        song={editSong ?? undefined}
        onSuccess={onMutated}
      />

      <DeleteSongDialog
        open={!!deleteSong}
        onOpenChange={(open) => !open && setDeleteSong(null)}
        song={deleteSong}
        onSuccess={onMutated}
      />
    </div>
  );
}
