import type { ApiEnvelope, SongQuery } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// All calls go through the Next.js proxy (src/app/api/prototype), which adds the Bearer token from the httpOnly cookie.
export async function protoFetch<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  let res: Response;
  try {
    res = await fetch(`/api/prototype${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(0, "You appear to be offline.");
  }

  const body = await res.json().catch(() => ({ message: res.statusText }));

  if (res.status === 401) {
    // Expired or missing token — clear the cookie and come back here after logging in.
    const from = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/prototype/auth/logout?from=${encodeURIComponent(from)}`);
  }

  if (!res.ok) {
    throw new ApiError(res.status, body.message ?? `Request failed (${res.status})`);
  }

  return body as ApiEnvelope<T>;
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

export const qk = {
  me: ["me"] as const,
  home: ["home"] as const,
  songs: (q: SongQuery) =>
    [
      "songs",
      q.search.trim(),
      q.sort ?? "title-asc",
      [...(q.keys ?? [])].sort(),
      [...(q.artists ?? [])].sort(),
    ] as const,
  songKeys: ["song-keys"] as const,
  artists: ["artists"] as const,
  song: (id: number) => ["song", id] as const,
  playlists: ["playlists"] as const,
  playlist: (id: number) => ["playlist", id] as const,
  playlistPreview: (token: string) => ["playlist-preview", token] as const,
  requests: ["song-requests"] as const,
  searchHistory: ["search-history"] as const,
  favorites: ["favorites"] as const,
};
