import { protoFetch } from "./api";
import type { PlaylistDetail, PlaylistPreview, PlaylistSummary, ShareLink } from "./types";

const json = (body: unknown) => JSON.stringify(body);

export async function listPlaylists() {
  // The API defaults to 10 per page; the prototype shows them all in one list.
  return (await protoFetch<PlaylistSummary[]>("/playlists?page=1&limit=100")).data ?? [];
}

export async function getPlaylist(id: number) {
  return (await protoFetch<PlaylistDetail>(`/playlists/${id}`)).data;
}

export async function createPlaylist(name: string) {
  return (await protoFetch<PlaylistSummary>("/playlists", { method: "POST", body: json({ playlist_name: name }) }))
    .data;
}

export async function renamePlaylist(id: number, name: string) {
  await protoFetch(`/playlists/${id}`, { method: "PUT", body: json({ playlist_name: name }) });
}

export async function deletePlaylist(id: number) {
  await protoFetch(`/playlists/${id}`, { method: "DELETE" });
}

// Adds one song and stores the key it should be played in for this playlist.
export async function addSongWithKey(playlistId: number, songId: number, key: string) {
  await protoFetch(`/playlists/${playlistId}/songs/${songId}`, { method: "POST", body: json({ base_chord: key }) });
}

// Appends songs (duplicates are skipped server-side). Note the camelCase body field.
export async function addSongs(playlistId: number, songIds: number[]) {
  await protoFetch(`/playlists/${playlistId}/songs`, { method: "POST", body: json({ songIds }) });
}

// Singular "song" in the path is intentional — that's the backend route.
export async function removeSong(playlistId: number, songId: number) {
  await protoFetch(`/playlists/${playlistId}/song/${songId}`, { method: "DELETE" });
}

// The backend keeps only the ids sent, in that order — always pass the FULL list or songs are dropped.
export async function reorderSongs(playlistId: number, allSongIds: number[]) {
  await protoFetch(`/playlists/${playlistId}/reorder`, { method: "PUT", body: json({ song_ids: allSongIds }) });
}

// Every call issues a new token and invalidates the previous link.
export async function createShareLink(playlistId: number) {
  return (await protoFetch<ShareLink>(`/playlists/${playlistId}/sharelink`, { method: "POST" })).data;
}

export async function getPlaylistPreview(token: string) {
  return (await protoFetch<PlaylistPreview>(`/playlists/preview/${encodeURIComponent(token)}`)).data;
}

export async function joinPlaylist(token: string) {
  return (
    await protoFetch<{ playlist_id: number; playlist_team_id: number }>(
      `/playlists/join/${encodeURIComponent(token)}`,
      { method: "POST" },
    )
  ).data;
}

export function shareUrl(token: string) {
  return `${window.location.origin}/prototype/join/${token}`;
}

export function canEditSongs(access: PlaylistSummary["access_type"] | undefined) {
  return access === "owner" || access === "leader" || access === "co-lead";
}
