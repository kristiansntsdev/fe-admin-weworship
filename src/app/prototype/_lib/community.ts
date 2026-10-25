// Client-only community feed — localStorage mock until a backend exists.
// "new_song" posts are derived from GET /home recent_songs (not persisted).

import type { RecentSong } from "./types";

export type CommunitySong = {
  /** Real catalog id when known; omitted for seed/demo songs. */
  id?: number;
  title: string;
  artist: string;
  key?: string | null;
};

export type CommunityPostKind = "playlist" | "new_song";

export type CommunityPost = {
  id: string;
  kind: CommunityPostKind;
  authorName: string;
  authorHandle: string;
  authorVerified: boolean;
  description: string;
  playlistId: number;
  playlistName: string;
  songCount: number;
  songs: CommunitySong[];
  youtubePlaylistUrl?: string;
  likeCount: number;
  likedByMe: boolean;
  /** How many times someone copied this playlist into their library. */
  copyCount: number;
  createdAt: string;
};

export function isSystemPost(post: Pick<CommunityPost, "id" | "kind">): boolean {
  return post.kind === "new_song" || post.id.startsWith("new-song-");
}

/** Fallback options when the user has no API playlists yet. */
export type MockPlaylistOption = {
  id: number;
  playlist_name: string;
  songCount: number;
};

const STORAGE_KEY = "ww-prototype-community-posts-v4";

export const MOCK_PLAYLIST_SONGS: Record<number, CommunitySong[]> = {
  [-1]: [
    { title: "Amazing Grace", artist: "Traditional", key: "G" },
    { title: "It Is Well", artist: "Horatio Spafford", key: "C" },
    { title: "What a Friend We Have in Jesus", artist: "Joseph Scriven", key: "F" },
    { title: "Nearer, My God, to Thee", artist: "Sarah Adams", key: "G" },
    { title: "Be Still My Soul", artist: "Katharina von Schlegel", key: "D" },
    { title: "Great Is Thy Faithfulness", artist: "Thomas Chisholm", key: "D" },
    { title: "Blessed Assurance", artist: "Fanny Crosby", key: "C" },
    { title: "How Great Thou Art", artist: "Carl Boberg", key: "A" },
  ],
  [-2]: [
    { title: "Open the Eyes of My Heart", artist: "Paul Baloche", key: "E" },
    { title: "Here I Am to Worship", artist: "Tim Hughes", key: "E" },
    { title: "How Great Is Our God", artist: "Chris Tomlin", key: "G" },
    { title: "Mighty to Save", artist: "Hillsong", key: "A" },
    { title: "Cornerstone", artist: "Hillsong", key: "C" },
    { title: "Goodness of God", artist: "Bethel Music", key: "A" },
  ],
  [-3]: [
    { title: "Good Morning God", artist: "JPCC Worship", key: "G" },
    { title: "Bapa Engkau Sungguh Baik", artist: "Franky Sihombing", key: "G" },
    { title: "Kasih Tuhan", artist: "GBI Keluarga Allah", key: "C" },
    { title: "Sungguh Indah", artist: "Symphony Worship", key: "D" },
    { title: "Yesus Yang Kupercaya", artist: "WTC", key: "A" },
    { title: "Kau Membuatku Bahagia", artist: "GMS Live", key: "E" },
    { title: "Terima Kasih Tuhan", artist: "JPCC Worship", key: "G" },
    { title: "Ku Mau Cinta Yesus", artist: "Symphony", key: "C" },
    { title: "Raja Segala Raja", artist: "True Worshippers", key: "D" },
    { title: "Puji Nama-Nya", artist: "JPCC Worship", key: "A" },
  ],
};

export const MOCK_PLAYLISTS: MockPlaylistOption[] = [
  { id: -1, playlist_name: "Saat Sedih", songCount: MOCK_PLAYLIST_SONGS[-1].length },
  { id: -2, playlist_name: "Sunday Set A", songCount: MOCK_PLAYLIST_SONGS[-2].length },
  { id: -3, playlist_name: "Pujian Pagi", songCount: MOCK_PLAYLIST_SONGS[-3].length },
];

const SEED: CommunityPost[] = [
  {
    id: "seed-1",
    kind: "playlist",
    authorName: "Rina",
    authorHandle: "rina",
    authorVerified: false,
    description: "Playlist disaat aku lagi sedih",
    playlistId: -1,
    playlistName: "Saat Sedih",
    songCount: MOCK_PLAYLIST_SONGS[-1].length,
    songs: MOCK_PLAYLIST_SONGS[-1],
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMHjMZOz59Oq8RP4RV",
    likeCount: 12,
    likedByMe: false,
    copyCount: 34,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "seed-2",
    kind: "playlist",
    authorName: "Andi",
    authorHandle: "andi.w",
    authorVerified: true,
    description: "Setlist Minggu ini — siap ibadah!",
    playlistId: -2,
    playlistName: "Sunday Set A",
    songCount: MOCK_PLAYLIST_SONGS[-2].length,
    songs: MOCK_PLAYLIST_SONGS[-2],
    likeCount: 5,
    likedByMe: false,
    copyCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "seed-3",
    kind: "playlist",
    authorName: "Maya",
    authorHandle: "maya",
    authorVerified: true,
    description: "Lagu-lagu buat quiet time pagi",
    playlistId: -3,
    playlistName: "Pujian Pagi",
    songCount: MOCK_PLAYLIST_SONGS[-3].length,
    songs: MOCK_PLAYLIST_SONGS[-3],
    youtubePlaylistUrl: "https://music.youtube.com/playlist?list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI",
    likeCount: 21,
    likedByMe: true,
    copyCount: 56,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
];

function normalize(raw: Record<string, unknown>): CommunityPost | null {
  if (typeof raw.id !== "string" || typeof raw.description !== "string") return null;
  if (typeof raw.playlistId !== "number" || typeof raw.playlistName !== "string") return null;
  if (typeof raw.authorName !== "string" || typeof raw.authorHandle !== "string") return null;
  if (typeof raw.createdAt !== "string") return null;

  const fallbackSongs = MOCK_PLAYLIST_SONGS[raw.playlistId as number] ?? [];
  const songs = Array.isArray(raw.songs) ? (raw.songs as CommunitySong[]) : fallbackSongs;
  const songCount = typeof raw.songCount === "number" ? raw.songCount : songs.length;
  const kind: CommunityPostKind = raw.kind === "new_song" ? "new_song" : "playlist";

  return {
    id: raw.id,
    kind,
    authorName: raw.authorName,
    authorHandle: raw.authorHandle,
    authorVerified: Boolean(raw.authorVerified),
    description: raw.description,
    playlistId: raw.playlistId,
    playlistName: raw.playlistName,
    songCount,
    songs,
    youtubePlaylistUrl: typeof raw.youtubePlaylistUrl === "string" ? raw.youtubePlaylistUrl : undefined,
    likeCount: typeof raw.likeCount === "number" ? raw.likeCount : 0,
    likedByMe: Boolean(raw.likedByMe),
    copyCount: typeof raw.copyCount === "number" ? raw.copyCount : 0,
    createdAt: raw.createdAt,
  };
}

/** Turn catalog recent_songs into WeWorship system posts for the community feed. */
export function postsFromRecentSongs(recent: RecentSong[]): CommunityPost[] {
  return recent.map((s) => ({
    id: `new-song-${s.id}`,
    kind: "new_song" as const,
    authorName: "WeWorship",
    authorHandle: "weworship",
    authorVerified: true,
    description: `New song added: ${s.title}`,
    playlistId: 0,
    playlistName: s.title,
    songCount: 1,
    songs: [
      {
        id: s.id,
        title: s.title,
        artist: s.artist ?? "",
        key: s.key,
      },
    ],
    likeCount: 0,
    likedByMe: false,
    copyCount: 0,
    createdAt: s.createdAt ?? new Date().toISOString(),
  }));
}

/** Merge API-derived new-song posts with local playlist posts, newest first. */
export function mergeCommunityFeed(local: CommunityPost[], recent: RecentSong[]): CommunityPost[] {
  return [...postsFromRecentSongs(recent), ...local].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

function persist(posts: CommunityPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  return posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
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
    if (!Array.isArray(parsed)) return [...SEED];
    const posts = parsed.map((p) => (p && typeof p === "object" ? normalize(p as Record<string, unknown>) : null)).filter(Boolean) as CommunityPost[];
    return posts.length ? persist(posts) : [...SEED];
  } catch {
    return [...SEED];
  }
}

export function getPost(id: string): CommunityPost | undefined {
  return loadPosts().find((p) => p.id === id);
}

export function savePost(post: CommunityPost): CommunityPost[] {
  return persist([post, ...loadPosts().filter((p) => p.id !== post.id)]);
}

export function toggleLike(postId: string): CommunityPost[] {
  const posts = loadPosts().map((p) => {
    if (p.id !== postId) return p;
    const likedByMe = !p.likedByMe;
    return { ...p, likedByMe, likeCount: Math.max(0, p.likeCount + (likedByMe ? 1 : -1)) };
  });
  return persist(posts);
}

export function incrementCopyCount(postId: string): CommunityPost[] {
  const posts = loadPosts().map((p) => (p.id === postId ? { ...p, copyCount: p.copyCount + 1 } : p));
  return persist(posts);
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

export function songsForMockPlaylist(playlistId: number): CommunitySong[] {
  return MOCK_PLAYLIST_SONGS[playlistId] ?? [];
}
