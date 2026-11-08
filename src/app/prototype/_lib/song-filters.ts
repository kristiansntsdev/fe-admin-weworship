import { create } from "zustand";

import type { SongSort } from "./types";

interface SongFiltersState {
  query: string;
  sort: SongSort;
  keys: string[];
  artists: string[];
  /** Mood tag ids. */
  moods: number[];
  setQuery: (query: string) => void;
  setSort: (sort: SongSort) => void;
  toggleKey: (key: string) => void;
  toggleArtist: (artist: string) => void;
  toggleMood: (tagId: number) => void;
  clearFilters: () => void;
}

const toggle = <T>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

// Module-level (not component state) so search, sort and filters survive opening a song and coming back.
export const useSongFilters = create<SongFiltersState>()((set) => ({
  query: "",
  sort: "title-asc",
  keys: [],
  artists: [],
  moods: [],
  // Starting a search switches the default A–Z order to "Best match"; clearing it switches back.
  // An order the user picked themselves (Title Z–A, Key …) is left alone.
  setQuery: (query) =>
    set((s) => {
      const searching = query.trim() !== "";
      const wasSearching = s.query.trim() !== "";
      if (searching && !wasSearching && s.sort === "title-asc") return { query, sort: "relevance" };
      if (!searching && s.sort === "relevance") return { query, sort: "title-asc" };
      return { query };
    }),
  setSort: (sort) => set({ sort }),
  toggleKey: (key) => set((s) => ({ keys: toggle(s.keys, key) })),
  toggleArtist: (artist) => set((s) => ({ artists: toggle(s.artists, artist) })),
  toggleMood: (tagId) => set((s) => ({ moods: toggle(s.moods, tagId) })),
  clearFilters: () => set({ keys: [], artists: [], moods: [] }),
}));
