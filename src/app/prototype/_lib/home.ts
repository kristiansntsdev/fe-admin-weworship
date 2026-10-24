import { protoFetch } from "./api";
import type { HomeStats } from "./types";

export async function getHomeStats() {
  return (await protoFetch<HomeStats>("/home")).data;
}

export interface RankedSong {
  id: number;
  title: string;
  artist: string | null;
  key: string | null;
  count: number;
}

// Mock rankings until the backend has an endpoint for them (song_events is never written, so there is no
// view data yet). Real catalog songs so each row opens a working song page — only the counts are made up.
export const POPULAR_SONGS: RankedSong[] = [
  { id: 393, title: "Christ Jesus Glorified", artist: "JPCC Worship", key: "B", count: 312 },
  { id: 118, title: "Di Setiap Nafasku", artist: "JPCC Worship Youth", key: "G", count: 287 },
  { id: 224, title: "Amazing Grace (My Chains Are Gone)", artist: "Chris Tomlin", key: "F", count: 240 },
  { id: 382, title: "Walau Gunung Tak Berpindah", artist: "Yeshua Abraham", key: "A", count: 198 },
  { id: 22, title: "Dengan SayapMu", artist: "Sari Simorangkir", key: "C", count: 176 },
];

export const MOST_ADDED_SONGS: RankedSong[] = [
  { id: 58, title: "Semua Baik", artist: "Jeffrey S Tjandra", key: "A", count: 48 },
  { id: 171, title: "Ajaib Kau Yesus", artist: "Ir. Niko Njotorahardjo", key: "D", count: 41 },
  { id: 248, title: "Where You Go I Go", artist: "Brian Johnson", key: "Bm", count: 36 },
  { id: 140, title: "Show Me Your Face Lord", artist: "UPPERROOM", key: "C", count: 29 },
  { id: 61, title: "Tenang", artist: "GMS", key: "A", count: 25 },
];

// Public-domain hymn for the landing page transpose demo, so it works signed out and offline.
export const DEMO_SONG = {
  title: "Amazing Grace",
  credit: "John Newton · Public domain",
  // D sits near the start of the key picker, so the selected chip is visible without scrolling.
  key: "D",
  chordpro: [
    "{comment: Verse 1}",
    "A[D]mazing [D7]grace, how [G]sweet the [D]sound",
    "That [D]saved a wretch like [A]me",
    "I [D]once was [D7]lost, but [G]now am [D]found",
    "Was [Bm]blind, but [A]now I [D]see",
  ].join("\n"),
};
