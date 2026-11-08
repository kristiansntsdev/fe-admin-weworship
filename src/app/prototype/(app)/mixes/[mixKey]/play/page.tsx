"use client";

import { use } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

import { SongPager } from "../../../../_components/song-pager";
import { errorMessage } from "../../../../_lib/api";
import { mixHref, useMix } from "../../../../_lib/mixes";

// Each song plays in its own key (a mix has no per-song keys, unlike a playlist).
export default function MixPlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ mixKey: string }>;
  searchParams: Promise<{ i?: string }>;
}) {
  const { mixKey } = use(params);
  const { i: startParam } = use(searchParams);
  const { mix, isPending, error } = useMix(mixKey);

  return (
    <SongPager
      songIds={mix?.songs.map((s) => s.id) ?? []}
      title={mix?.title ?? "Mix"}
      backHref={mixHref(mixKey)}
      startIndex={Math.max(0, Number(startParam) || 0)}
      pending={isPending}
      unavailable={
        error || !mix ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Mix unavailable</EmptyTitle>
              <EmptyDescription>{errorMessage(error)}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" asChild>
                <Link href="/prototype/home">Back to home</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : undefined
      }
      emptyDescription="No songs match this mix yet."
    />
  );
}
