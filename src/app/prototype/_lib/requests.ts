import { protoFetch } from "./api";
import type { LyricsType, SongRequest } from "./types";

export async function listRequests() {
  // Song requests nest pagination inside data: { data, total, page, limit }.
  const res = await protoFetch<{ data: SongRequest[] | null }>("/song-requests?page=1&limit=100");
  return res.data.data ?? [];
}

export async function createRequest(input: {
  song_title: string;
  lyrics_type: LyricsType;
  lyrics?: string;
  reference_link?: string;
}) {
  return (await protoFetch<SongRequest>("/song-requests", { method: "POST", body: JSON.stringify(input) })).data;
}

export async function deleteRequest(id: number) {
  await protoFetch(`/song-requests/${id}`, { method: "DELETE" });
}
