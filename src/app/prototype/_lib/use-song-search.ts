import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import { qk } from "./api";
import { searchSongs } from "./songs";
import type { SongQuery } from "./types";

// Shared by the Songs tab and the "Add songs" sheet so both reuse the same cached pages.
// keepPreviousData: changing a filter or sort keeps the current list on screen until the new one arrives.
export function useSongSearch(q: SongQuery, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: qk.songs(q),
    queryFn: ({ pageParam }) => searchSongs({ ...q, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination?.hasNextPage ? last.pagination.currentPage + 1 : undefined),
    placeholderData: keepPreviousData,
    enabled,
  });

  const songs = query.data?.pages.flatMap((p) => p.data ?? []) ?? [];
  const total = query.data?.pages[0]?.pagination?.totalItems;

  return { ...query, songs, total };
}
