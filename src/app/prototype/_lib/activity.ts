import { protoFetch } from "./api";
import type { Song } from "./types";

export async function getSearchHistory(limit = 30) {
  return (await protoFetch<string[]>(`/songs/search-history?limit=${limit}`)).data ?? [];
}

export async function listFavorites() {
  return (await protoFetch<Song[]>("/favorites")).data ?? [];
}

export async function toggleFavorite(songId: number) {
  return (await protoFetch<{ song_id: number; is_favorite: boolean }>(`/favorites/${songId}/toggle`, { method: "POST" }))
    .data;
}
