import { protoFetch } from "./api";
import type { Artist, Me, Song, SongKeyCount, SongQuery, SongSort, Tag } from "./types";

export const SONGS_PAGE_SIZE = 20;

// "relevance" ranks text + semantic (meaning) matches; the backend falls back to Title A–Z without a query.
export const SONG_SORTS: Record<SongSort, { label: string; sortBy: string; sortOrder: "ASC" | "DESC" }> = {
  relevance: { label: "Best match", sortBy: "relevance", sortOrder: "DESC" },
  "title-asc": { label: "Title A–Z", sortBy: "title", sortOrder: "ASC" },
  "title-desc": { label: "Title Z–A", sortBy: "title", sortOrder: "DESC" },
  "key-asc": { label: "Key A–Z", sortBy: "base_chord", sortOrder: "ASC" },
  "key-desc": { label: "Key Z–A", sortBy: "base_chord", sortOrder: "DESC" },
};

// chordpro=true: browsers don't get the mobile UA override, so legacy HTML songs would otherwise be included.
// encodeURIComponent (not URLSearchParams) so spaces become %20 — the Go search splits words on spaces.
// key / artist are repeated params because artist names can contain commas.
export function searchSongs({
  search,
  page,
  sort = "title-asc",
  keys = [],
  artists = [],
  moods = [],
}: SongQuery & { page: number }) {
  const q = search.trim();
  const { sortBy, sortOrder } = SONG_SORTS[sort];
  const params = [
    `page=${page}`,
    `limit=${SONGS_PAGE_SIZE}`,
    "chordpro=true",
    `sortBy=${sortBy}`,
    `sortOrder=${sortOrder}`,
    ...(q ? [`search=${encodeURIComponent(q)}`] : []),
    ...keys.map((k) => `key=${encodeURIComponent(k)}`),
    ...artists.map((a) => `artist=${encodeURIComponent(a)}`),
    ...(moods.length ? [`tag_ids=${moods.join(",")}`] : []),
  ].join("&");
  return protoFetch<Song[]>(`/songs?${params}`);
}

// Moods are tags described "Mood". Shown in this order (the same as the home mood chips), unknown ones last.
const MOOD_ORDER = ["Calm", "Joyful", "Prayer", "Hope", "Christmas", "Easter"];

export async function getMoodTags() {
  const tags = (await protoFetch<Tag[]>("/tags")).data ?? [];
  const rank = (t: Tag) => {
    const i = MOOD_ORDER.indexOf(t.name);
    return i < 0 ? MOOD_ORDER.length : i;
  };
  return tags.filter((t) => t.description === "Mood").sort((a, b) => rank(a) - rank(b));
}

export async function getSongKeys() {
  return (await protoFetch<SongKeyCount[]>("/songs/keys")).data ?? [];
}

export async function getArtists() {
  return (await protoFetch<Artist[]>("/artists")).data ?? [];
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
