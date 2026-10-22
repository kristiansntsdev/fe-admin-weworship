import { useInfiniteQuery } from "@tanstack/react-query";

import { qk } from "./api";
import { searchSongs } from "./songs";

// Shared by the Songs tab and the "Add songs" sheet so both reuse the same cached pages.
export function useSongSearch(search: string, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: qk.songs(search.trim()),
    queryFn: ({ pageParam }) => searchSongs({ search, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination?.hasNextPage ? last.pagination.currentPage + 1 : undefined),
    enabled,
  });

  const songs = query.data?.pages.flatMap((p) => p.data ?? []) ?? [];
  const total = query.data?.pages[0]?.pagination?.totalItems;

  return { ...query, songs, total };
}
