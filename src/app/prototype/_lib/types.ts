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
  /** Present on GET /songs/:id and GET /favorites when authenticated. */
  is_favorite?: boolean;
}

/** Song ranked by views or playlist adds — included on GET /home. */
export interface RankedSong {
  id: number;
  title: string;
  artist: string | null;
  key: string | null;
  count: number;
}

/** Newest catalog songs — included on GET /home as recent_songs. */
export interface RecentSong {
  id: number;
  title: string;
  artist: string | null;
  key: string | null;
  createdAt: string | null;
}

// GET /home — public catalog overview + rankings from song_events.
export interface HomeStats {
  song_count: number;
  artist_count: number;
  shareable_playlist_count: number;
  weekly_share_count: number;
  popular_songs?: RankedSong[];
  most_added_songs?: RankedSong[];
  recent_songs?: RecentSong[];
}

/** One song in a mix: a snapshot stored with the mix, so listing a mix fetches no songs. */
export interface MixSong {
  id: number;
  title: string;
  artist: string | null;
  key: string | null;
}

/** A personal mix (key mix-1..mix-3 or supermix) or a mood mix (key mood-<id>). */
export interface Mix {
  key: string;
  title: string;
  /** Most frequent artists, e.g. "Bethel Music, JPCC Worship". */
  subtitle: string;
  songs: MixSong[];
}

export interface MixMood {
  id: string;
  label: string;
}

// GET /mixes — personal mixes (rebuilt at most daily from the user's history) plus mood chips.
export interface MixesResponse {
  /** false until the user has enough history (opened, favorited, added or searched songs). */
  personalized: boolean;
  mixes: Mix[];
  /** Empty when the server has no embedding service — hide the shelf. */
  moods: MixMood[];
}

export type SongSort = "relevance" | "title-asc" | "title-desc" | "key-asc" | "key-desc";

export interface SongQuery {
  search: string;
  sort?: SongSort;
  keys?: string[];
  artists?: string[];
  /** Mood tag ids (tags described "Mood", e.g. Calm, Joyful). A song matches if it has any of them. */
  moods?: number[];
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

/** viewer = someone else's public playlist: read-only, can play and save a copy. */
export type PlaylistAccess = "owner" | "leader" | "co-lead" | "member" | "viewer";

/** Public identity of a user — never email. */
export interface PlaylistOwner {
  username: string;
  display_name: string;
  verified: boolean;
}

export interface PlaylistSummary {
  id: number;
  playlist_name: string;
  user_id: number;
  songs: number[] | null;
  /** false = private (the default for new playlists). */
  is_public: boolean;
  createdAt: string;
  updatedAt: string;
  access_type: PlaylistAccess;
}

/** What a published playlist shows to the public: lyrics only, or lyrics with chords. */
export type PublicViewMode = "lyrics" | "lyrics_chords";

export interface PlaylistDetail extends PlaylistSummary {
  owner?: PlaylistOwner;
  /** Owner only. Set once the playlist has been published; kept when it is unpublished. */
  public_token?: string | null;
  public_view_mode?: PublicViewMode;
  song_keys?: Record<string, string> | null;
  share_token?: string | null;
  sharable_link?: string | null;
  playlist_team_id?: number | null;
  is_shared?: number | boolean;
}

// GET /profiles?q= — people search result.
export interface ProfileSummary extends PlaylistOwner {
  avatar_url: string | null;
  public_playlists: number;
}

export interface PublicPlaylist {
  id: number;
  playlist_name: string;
  song_count: number;
  updatedAt: string;
}

// GET /profiles/:username — a user's public page.
export interface PublicProfile extends PlaylistOwner {
  avatar_url: string | null;
  playlists: PublicPlaylist[];
}

export interface PlaylistPreview {
  playlist_name: string;
  owner_name: string;
  song_count: number;
  member_count: number;
}

export interface PublishedSong {
  id: number;
  title: string;
  artist: string[] | string | null;
  /** Key chosen for this playlist. */
  key: string | null;
  /** Key the chords in lyrics_and_chords are written in. */
  original_key: string | null;
  lyrics_and_chords: string | null;
  /** Lyrics withheld (takedown). */
  unavailable?: boolean;
}

// GET /playlists/public/:token — readable without signing in.
export interface PublishedPlaylist {
  playlist_name: string;
  owner?: PlaylistOwner;
  view_mode: PublicViewMode;
  song_count: number;
  updatedAt: string;
  songs: PublishedSong[];
}

export interface PublishResult {
  id: number;
  is_public: boolean;
  public_token: string;
  public_view_mode: PublicViewMode;
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

// POST /song-requests/check-link — can a chord sheet be read from this reference link?
export type SongLinkStatus = "supported" | "collection" | "unsupported" | "unreachable";

export interface SongLinkCheck {
  status: SongLinkStatus;
  url: string;
  source: string;
  title?: string;
  artist?: string;
  key?: string;
  lyrics_type?: LyricsType;
  content?: string; // chord-over-lyrics text, set when status is "supported"
  songs?: { title: string; url: string }[]; // set when status is "collection"
  reason?: string;
}

export interface Me {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin" | "maintainer";
  verified?: boolean;
  avatar_url?: string | null;
}

export type VerificationRequestStatus = "pending" | "approved" | "rejected";

export interface VerificationRequest {
  id: number;
  user_id: number;
  display_name: string;
  proof_link: string;
  note: string | null;
  status: VerificationRequestStatus;
  admin_notes: string | null;
  createdAt: string;
  updatedAt: string;
}
