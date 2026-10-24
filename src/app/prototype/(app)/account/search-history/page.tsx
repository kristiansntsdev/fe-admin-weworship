"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../../_components/page-header";
import { SongRow } from "../../../_components/song-row";
import { getViewHistory } from "../../../_lib/activity";
import { errorMessage, qk } from "../../../_lib/api";

export default function SearchHistoryPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: qk.searchHistory,
    queryFn: () => getViewHistory(40),
  });

  return (
    <>
      <PageHeader title="Search history" backHref="/prototype/account" />

      {isPending ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : isError ? (
        <p className="p-4 text-destructive text-sm">{errorMessage(error)}</p>
      ) : !data?.length ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyTitle>Belum ada riwayat</EmptyTitle>
            <EmptyDescription>
              Lagu yang kamu buka dari pencarian muncul di sini.{" "}
              <Link href="/prototype/songs" className="font-medium text-primary hover:underline">
                Cari lagu
              </Link>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y">
          {data.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              href={`/prototype/songs/${song.id}?from=${encodeURIComponent("/prototype/account/search-history")}`}
            />
          ))}
        </ul>
      )}
    </>
  );
}
