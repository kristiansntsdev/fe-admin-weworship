// Backend (be-weworship) shapes, kept as returned by the API — no client-side mapping layer.

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface Tag {
  id: number;
  name: string;
  description: string | null;
}

export interface Song {
  id: number;
  slug: string | null;
  title: string;
  artist: string[] | string | null;
  base_chord: string | null;
  bpm: number | null;
  lyrics_and_chords: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  apple_music_url: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

/** Song ranked by views or playlist adds — included on GET /home. */
export interface RankedSong {
  id: number;
  title: string;
  artist: string | null;
  key: string | null;
  count: number;
}

// GET /home — public catalog overview + rankings from song_events.
export interface HomeStats {
  song_count: number;
  artist_count: number;
  shareable_playlist_count: number;
  weekly_share_count: number;
  popular_songs?: RankedSong[];
  most_added_songs?: RankedSong[];
}

export type SongSort = "relevance" | "title-asc" | "title-desc" | "key-asc" | "key-desc";

export interface SongQuery {
  search: string;
  sort?: SongSort;
  keys?: string[];
  artists?: string[];
}

export interface Artist {
  id: string;
  name: string;
  count: number;
}

export interface SongKeyCount {
  key: string;
  count: number;
}

export type PlaylistAccess = "owner" | "leader" | "co-lead" | "member";

export interface PlaylistSummary {
  id: number;
  playlist_name: string;
  user_id: number;
  songs: number[] | null;
  createdAt: string;
  updatedAt: string;
  access_type: PlaylistAccess;
}

export interface PlaylistDetail extends PlaylistSummary {
  song_keys?: Record<string, string> | null;
  share_token?: string | null;
  sharable_link?: string | null;
  playlist_team_id?: number | null;
  is_shared?: number | boolean;
}

export interface PlaylistPreview {
  playlist_name: string;
  owner_name: string;
  song_count: number;
  member_count: number;
}

export interface ShareLink {
  playlist_id: number;
  playlist_team_id: number;
  share_token: string;
  sharable_link: string;
}

export type SongRequestStatus = "pending" | "in_progress" | "approved" | "rejected";
export type LyricsType = "lyrics" | "lyrics_chords";

export interface SongRequest {
  id: number;
  user_id: number;
  song_title: string;
  reference_link: string | null;
  lyrics_type: LyricsType;
  lyrics: string | null;
  status: SongRequestStatus;
  admin_notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Me {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin" | "maintainer";
  avatar_url?: string | null;
}
