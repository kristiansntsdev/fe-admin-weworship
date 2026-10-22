import { protoFetch } from "./api";
import type { Me, Song } from "./types";

export const SONGS_PAGE_SIZE = 20;

// chordpro=true: browsers don't get the mobile UA override, so legacy HTML songs would otherwise be included.
// encodeURIComponent (not URLSearchParams) so spaces become %20 — the Go search splits words on spaces.
export function searchSongs({ search, page }: { search: string; page: number }) {
  const q = search.trim();
  const params = [
    `page=${page}`,
    `limit=${SONGS_PAGE_SIZE}`,
    "chordpro=true",
    "sortBy=title",
    "sortOrder=ASC",
    ...(q ? [`search=${encodeURIComponent(q)}`] : []),
  ].join("&");
  return protoFetch<Song[]>(`/songs?${params}`);
}

export async function getSong(id: number) {
  return (await protoFetch<Song>(`/songs/${id}`)).data;
}

export async function getMe() {
  return (await protoFetch<{ user: Me }>("/auth/me")).data.user;
}

export function artistLabel(artist: Song["artist"]): string {
  if (!artist) return "";
  return Array.isArray(artist) ? artist.join(", ") : artist;
}
