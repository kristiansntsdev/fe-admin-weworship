import { protoFetch } from "./api";
import type { HomeStats, RankedSong } from "./types";

export type { RankedSong };

export async function getHomeStats() {
  return (await protoFetch<HomeStats>("/home")).data;
}

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
