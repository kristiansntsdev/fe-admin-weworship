import { useQuery } from "@tanstack/react-query";

import { protoFetch, qk } from "./api";
import type { Mix, MixesResponse } from "./types";

export const MOOD_KEY_PREFIX = "mood-";

// The server keeps each mix for a day, so there is no point refetching on every visit.
const MIX_STALE_TIME = 5 * 60_000;

export async function getMixes() {
  return (await protoFetch<MixesResponse>("/mixes")).data;
}

export async function getMoodMix(moodId: string) {
  return (await protoFetch<Mix>(`/mixes/moods/${encodeURIComponent(moodId)}`)).data;
}

export function mixHref(key: string) {
  return `/prototype/mixes/${encodeURIComponent(key)}`;
}

export function moodMixKey(moodId: string) {
  return `${MOOD_KEY_PREFIX}${moodId}`;
}

export function useMixes() {
  return useQuery({ queryKey: qk.mixes, queryFn: getMixes, staleTime: MIX_STALE_TIME });
}

// A mood key (mood-calm) loads that mood's mix; any other key is looked up among the personal mixes,
// which change daily — so an old link can point at a mix that no longer exists.
export function useMix(key: string) {
  const moodId = key.startsWith(MOOD_KEY_PREFIX) ? key.slice(MOOD_KEY_PREFIX.length) : null;
  const moodQuery = useQuery({
    queryKey: qk.moodMix(moodId ?? ""),
    queryFn: () => getMoodMix(moodId ?? ""),
    enabled: moodId !== null,
    staleTime: MIX_STALE_TIME,
  });
  const mixesQuery = useQuery({
    queryKey: qk.mixes,
    queryFn: getMixes,
    enabled: moodId === null,
    staleTime: MIX_STALE_TIME,
  });

  if (moodId !== null) {
    return { mix: moodQuery.data, isPending: moodQuery.isPending, error: moodQuery.error };
  }
  const mix = mixesQuery.data?.mixes.find((m) => m.key === key);
  const missing =
    mixesQuery.isSuccess && !mix ? new Error("This mix isn't available anymore — mixes refresh daily.") : null;
  return { mix, isPending: mixesQuery.isPending, error: mixesQuery.error ?? missing };
}
