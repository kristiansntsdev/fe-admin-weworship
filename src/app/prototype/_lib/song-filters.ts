import { create } from "zustand";

import type { SongSort } from "./types";

interface SongFiltersState {
  query: string;
  sort: SongSort;
  keys: string[];
  artists: string[];
  setQuery: (query: string) => void;
  setSort: (sort: SongSort) => void;
  toggleKey: (key: string) => void;
  toggleArtist: (artist: string) => void;
  clearFilters: () => void;
}

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// Module-level (not component state) so search, sort and filters survive opening a song and coming back.
export const useSongFilters = create<SongFiltersState>()((set) => ({
  query: "",
  sort: "title-asc",
  keys: [],
  artists: [],
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
  clearFilters: () => set({ keys: [], artists: [] }),
}));
