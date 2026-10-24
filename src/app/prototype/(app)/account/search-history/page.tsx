"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../../_components/page-header";
import { getSearchHistory } from "../../../_lib/activity";
import { errorMessage, qk } from "../../../_lib/api";
import { useSongFilters } from "../../../_lib/song-filters";

export default function SearchHistoryPage() {
  const router = useRouter();
  const setQuery = useSongFilters((s) => s.setQuery);
  const { data, isPending, isError, error } = useQuery({
    queryKey: qk.searchHistory,
    queryFn: () => getSearchHistory(40),
  });

  function openSearch(q: string) {
    setQuery(q);
    router.push("/prototype/songs");
  }

  return (
    <>
      <PageHeader title="Search history" backHref="/prototype/account" />

      {isPending ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <p className="p-4 text-destructive text-sm">{errorMessage(error)}</p>
      ) : !data?.length ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyTitle>No searches yet</EmptyTitle>
            <EmptyDescription>
              Searches from the Songs tab show up here.{" "}
              <Link href="/prototype/songs" className="font-medium text-primary hover:underline">
                Browse songs
              </Link>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y">
          {data.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => openSearch(q)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-medium">{q}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
