import { protoFetch } from "./api";
import type { ProfileSummary, PublicProfile } from "./types";

// The server ignores queries shorter than 2 characters (returns []), so callers can pass the raw input.
export async function searchProfiles(q: string) {
  return (await protoFetch<ProfileSummary[]>(`/profiles?q=${encodeURIComponent(q.trim())}`)).data ?? [];
}

export async function getProfile(username: string) {
  return (await protoFetch<PublicProfile>(`/profiles/${encodeURIComponent(username)}`)).data;
}

export function profileHref(username: string) {
  return `/prototype/u/${encodeURIComponent(username)}`;
}
