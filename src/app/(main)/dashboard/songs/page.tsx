import { api } from "@/lib/api";
import { SongsClient } from "./_components/songs-client";

export const dynamic = "force-dynamic";

export interface Song {
  id: number;
  title: string;
  slug: string;
  artist: string;
  base_chord: string;
  lyrics_and_chords: string;
  external_links: unknown;
  dmca_takedown: boolean;
  dmca_status_notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

async function fetchSongs(page = 1, limit = 20, search = "") {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    // BE returns: { code, message, data: Song[], pagination: {...} }
    const res = await api.get<Song[]>(`/api/songs?${params}`);
    const body = res as unknown as { data: Song[]; pagination: Pagination };
    const songs = body.data ?? [];
    const pagination = body.pagination ?? { currentPage: page, totalItems: songs.length, itemsPerPage: limit, totalPages: 1 };
    return { songs, total: pagination.totalItems, page: pagination.currentPage, limit: pagination.itemsPerPage };
  } catch {
    return { songs: [], total: 0, page: 1, limit };
  }
}

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const search = params.search ?? "";
  const { songs, total, limit } = await fetchSongs(page, 20, search);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-bold">Songs</h1>
        <p className="text-muted-foreground text-sm">Manage the song library</p>
      </div>
      <SongsClient songs={songs} total={total} limit={limit} currentPage={page} currentSearch={search} />
    </div>
  );
}
