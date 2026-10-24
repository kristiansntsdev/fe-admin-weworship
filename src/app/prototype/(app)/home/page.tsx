"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ListMusic, Music } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../_components/page-header";
import { MostAddedSongs, SampleBadge, TrendingSongs } from "../../_components/song-rankings";
import { qk } from "../../_lib/api";
import { getHomeStats, MOST_ADDED_SONGS, POPULAR_SONGS } from "../../_lib/home";
import { getMe } from "../../_lib/songs";

export default function AppHomePage() {
  const { data: me } = useQuery({ queryKey: qk.me, queryFn: getMe });
  const { data: stats, isError } = useQuery({ queryKey: qk.home, queryFn: getHomeStats });

  return (
    <>
      <PageHeader title="Home" />

      <div className="space-y-8 p-4">
        <div>
          <p className="text-muted-foreground text-sm">
            {me?.username ? `Welcome back, ${me.username}` : "Welcome back"}
          </p>
          <h2 className="pt-1 font-semibold text-xl tracking-tight">Ready for Sunday?</h2>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" asChild>
              <Link href="/prototype/songs">
                <Music />
                Browse songs
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/prototype/playlists">
                <ListMusic />
                Playlists
              </Link>
            </Button>
          </div>
        </div>

        <div>
          <p className="font-semibold text-primary text-xs uppercase tracking-wider">At a glance</p>
          <div className="grid grid-cols-3 gap-2 pt-3">
            <Stat value={stats?.song_count} label="Songs" failed={isError} />
            <Stat value={stats?.artist_count} label="Artists" failed={isError} />
            <Stat value={12} label="Keys" />
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between gap-3 pb-3">
            <div>
              <p className="font-semibold text-primary text-xs uppercase tracking-wider">Trending</p>
              <h3 className="font-semibold text-lg tracking-tight">Most popular</h3>
            </div>
            <SampleBadge />
          </div>
          <TrendingSongs songs={POPULAR_SONGS} />
        </div>

        <div>
          <div className="flex items-end justify-between gap-3 pb-3">
            <div>
              <p className="font-semibold text-primary text-xs uppercase tracking-wider">Setlists</p>
              <h3 className="font-semibold text-lg tracking-tight">Most added</h3>
            </div>
            <SampleBadge />
          </div>
          <MostAddedSongs songs={MOST_ADDED_SONGS} />
        </div>
      </div>
    </>
  );
}

function Stat({ value, label, failed }: { value?: number; label: string; failed?: boolean }) {
  return (
    <div className="rounded-xl border p-3 text-center">
      {value === undefined && !failed ? (
        <Skeleton className="mx-auto h-8 w-14" />
      ) : (
        <p className="font-semibold text-2xl tabular-nums">{value?.toLocaleString() ?? "—"}</p>
      )}
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
