import { protoFetch } from "./api";
import type { Song } from "./types";

/** Songs the user opened (clicked), newest first — not keystroke search queries. */
export async function getViewHistory(limit = 40) {
  return (await protoFetch<Song[]>(`/songs/view-history?limit=${limit}`)).data ?? [];
}

export async function listFavorites() {
  return (await protoFetch<Song[]>("/favorites")).data ?? [];
}

export async function toggleFavorite(songId: number) {
  return (await protoFetch<{ song_id: number; is_favorite: boolean }>(`/favorites/${songId}/toggle`, { method: "POST" }))
    .data;
}
