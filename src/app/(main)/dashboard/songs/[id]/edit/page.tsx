import { notFound } from "next/navigation";

import { api } from "@/lib/api";
import { SongFormPage } from "../../_components/song-form-page";
import type { Song } from "../../page";

export const dynamic = "force-dynamic";

async function fetchSong(id: string): Promise<Song | null> {
  try {
    const res = await api.get<Song>(`/api/songs/${id}`);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export default async function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const song = await fetchSong(id);

  if (!song) notFound();

  return (
    <div className="flex flex-col gap-5 p-2">
      <h1 className="text-xl font-medium">Edit Song</h1>
      <SongFormPage song={song} />
    </div>
  );
}
