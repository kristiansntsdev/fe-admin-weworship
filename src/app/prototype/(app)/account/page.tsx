"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, History, ListMusic, Settings, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../_components/page-header";
import { VerifiedBadge } from "../../_components/verified-badge";
import { errorMessage, qk } from "../../_lib/api";
import { listPlaylists } from "../../_lib/playlists";
import { getMe } from "../../_lib/songs";

const PLAYLIST_PREVIEW = 5;

export default function AccountPage() {
  const { data: me, isPending, isError, error } = useQuery({ queryKey: qk.me, queryFn: getMe });
  const playlistsQuery = useQuery({ queryKey: qk.playlists, queryFn: listPlaylists, enabled: !!me });

  const playlists = playlistsQuery.data ?? [];
  const preview = playlists.slice(0, PLAYLIST_PREVIEW);

  return (
    <>
      <PageHeader
        title="Profile"
        actions={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prototype/account/settings" aria-label="Settings">
              <Settings className="size-5" />
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 p-4">
        {isPending ? (
          <div className="flex flex-col items-center gap-3 pt-2">
            <Skeleton className="size-20 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
        ) : isError || !me ? (
          <p className="text-destructive text-sm">{errorMessage(error)}</p>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-2 text-center">
            {/* ponytail: plain img — avatar hosts vary; next/image needs remotePatterns */}
            {me.avatar_url ? (
              <img src={me.avatar_url} alt="" className="size-20 rounded-full object-cover" />
            ) : (
              <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-2xl text-primary-foreground uppercase">
                {me.username.slice(0, 1)}
              </span>
            )}
            <div className="min-w-0 space-y-1">
              <p className="flex items-center justify-center gap-1.5 font-semibold text-xl">
                <span className="truncate">{me.username}</span>
                {me.verified && <VerifiedBadge />}
              </p>
              <p className="truncate text-muted-foreground text-sm">{me.email}</p>
              {me.role !== "user" && (
                <Badge variant="secondary" className="mt-1">
                  {me.role}
                </Badge>
              )}
            </div>
          </div>
        )}

        {me && (
          <section className="space-y-2">
            <div className="flex items-end justify-between gap-2">
              <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">My playlists</h2>
              {playlists.length > 0 && (
                <Link href="/prototype/playlists" className="font-medium text-primary text-xs">
                  See all
                </Link>
              )}
            </div>
            {playlistsQuery.isPending ? (
              <ul className="divide-y rounded-lg border">
                {Array.from({ length: 3 }, (_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                  <li key={i} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="size-10 rounded-md" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : playlistsQuery.isError ? (
              <p className="text-destructive text-sm">{errorMessage(playlistsQuery.error)}</p>
            ) : playlists.length === 0 ? (
              <div className="rounded-lg border px-4 py-6 text-center">
                <ListMusic className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 font-medium text-sm">No playlists yet</p>
                <p className="mt-1 text-muted-foreground text-sm">Build a setlist for your next service.</p>
                <Button size="sm" className="mt-3" asChild>
                  <Link href="/prototype/playlists">Go to playlists</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y rounded-lg border">
                {preview.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/prototype/playlists/${p.id}`}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <ListMusic className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.playlist_name}</span>
                        <span className="block text-muted-foreground text-sm">
                          {p.songs?.length ?? 0} songs
                          {p.access_type !== "owner" ? " · Joined" : ""}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {me && (
          <section className="space-y-2">
            <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Activity</h2>
            <ul className="divide-y rounded-lg border">
              <li>
                <Link href="/prototype/account/favorites" className="flex items-center gap-3 px-4 py-3">
                  <Star className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Favorites</span>
                    <span className="block text-muted-foreground text-sm">Songs you have starred</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <Link href="/prototype/account/search-history" className="flex items-center gap-3 px-4 py-3">
                  <History className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Search history</span>
                    <span className="block text-muted-foreground text-sm">Songs you have recently searched</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
