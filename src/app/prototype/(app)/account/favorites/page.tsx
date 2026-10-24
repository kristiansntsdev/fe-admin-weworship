"use client";

import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../../_components/page-header";
import { SongRow } from "../../../_components/song-row";
import { listFavorites, toggleFavorite } from "../../../_lib/activity";
import { errorMessage, qk } from "../../../_lib/api";
import type { Song } from "../../../_lib/types";

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, error } = useQuery({
    queryKey: qk.favorites,
    queryFn: listFavorites,
  });

  const unstar = useMutation({
    mutationFn: (songId: number) => toggleFavorite(songId),
    onSuccess: (_res, songId) => {
      queryClient.setQueryData<Song[]>(qk.favorites, (prev) => prev?.filter((s) => s.id !== songId) ?? []);
      queryClient.invalidateQueries({ queryKey: qk.song(songId) });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <>
      <PageHeader title="Favorites" backHref="/prototype/account" />

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
            <EmptyTitle>No favorites yet</EmptyTitle>
            <EmptyDescription>
              Tap the star on a song to save it here.{" "}
              <Link href="/prototype/songs" className="font-medium text-primary hover:underline">
                Find songs
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
              href={`/prototype/songs/${song.id}?from=${encodeURIComponent("/prototype/account/favorites")}`}
              action={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Unfavorite ${song.title}`}
                  disabled={unstar.isPending}
                  onClick={() => unstar.mutate(song.id)}
                >
                  <Star className="fill-amber-400 text-amber-400" />
                </Button>
              }
            />
          ))}
        </ul>
      )}
    </>
  );
}
