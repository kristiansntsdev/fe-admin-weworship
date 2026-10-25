// Client-only community feed — localStorage mock until a backend exists.

export type CommunityPost = {
  id: string;
  authorName: string;
  authorHandle: string;
  description: string;
  playlistId: number;
  playlistName: string;
  songCount: number;
  youtubePlaylistUrl?: string;
  createdAt: string;
};

/** Fallback options when the user has no API playlists yet. */
export type MockPlaylistOption = {
  id: number;
  playlist_name: string;
  songCount: number;
};

const STORAGE_KEY = "ww-prototype-community-posts";

export const MOCK_PLAYLISTS: MockPlaylistOption[] = [
  { id: -1, playlist_name: "Saat Sedih", songCount: 8 },
  { id: -2, playlist_name: "Sunday Set A", songCount: 6 },
  { id: -3, playlist_name: "Pujian Pagi", songCount: 10 },
];

const SEED: CommunityPost[] = [
  {
    id: "seed-1",
    authorName: "Rina",
    authorHandle: "rina",
    description: "Playlist disaat aku lagi sedih",
    playlistId: -1,
    playlistName: "Saat Sedih",
    songCount: 8,
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMHjMZOz59Oq8RP4RV",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "seed-2",
    authorName: "Andi",
    authorHandle: "andi.w",
    description: "Setlist Minggu ini — siap ibadah!",
    playlistId: -2,
    playlistName: "Sunday Set A",
    songCount: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "seed-3",
    authorName: "Maya",
    authorHandle: "maya",
    description: "Lagu-lagu buat quiet time pagi",
    playlistId: -3,
    playlistName: "Pujian Pagi",
    songCount: 10,
    youtubePlaylistUrl: "https://music.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
];

function isPost(v: unknown): v is CommunityPost {
  if (!v || typeof v !== "object") return false;
  const p = v as CommunityPost;
  return (
    typeof p.id === "string" &&
    typeof p.authorName === "string" &&
    typeof p.authorHandle === "string" &&
    typeof p.description === "string" &&
    typeof p.playlistId === "number" &&
    typeof p.playlistName === "string" &&
    typeof p.songCount === "number" &&
    typeof p.createdAt === "string"
  );
}

export function loadPosts(): CommunityPost[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isPost)) return [...SEED];
    return parsed.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    return [...SEED];
  }
}

export function savePost(post: CommunityPost): CommunityPost[] {
  const next = [post, ...loadPosts().filter((p) => p.id !== post.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** Accepts youtube.com / music.youtube.com playlist URLs with a list= param. */
export function isYoutubePlaylistUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  try {
    const u = new URL(v);
    if (!/^(www\.)?(music\.)?youtube\.com$/i.test(u.hostname) && u.hostname !== "youtu.be") return false;
    return u.searchParams.has("list") || /\/playlist/i.test(u.pathname);
  } catch {
    return false;
  }
}
