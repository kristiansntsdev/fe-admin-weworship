"use client";

import { use } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Globe, ListMusic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../../_components/page-header";
import { UserAvatar } from "../../../_components/user-avatar";
import { VerifiedBadge } from "../../../_components/verified-badge";
import { ApiError, errorMessage, qk } from "../../../_lib/api";
import { getProfile } from "../../../_lib/profiles";
import { getMe } from "../../../_lib/songs";
import type { PublicPlaylist } from "../../../_lib/types";

function playlistMeta(p: PublicPlaylist) {
  const songs = `${p.song_count} song${p.song_count === 1 ? "" : "s"}`;
  const t = new Date(p.updatedAt).getTime();
  return t ? `${songs} · Updated ${formatDistanceToNowStrict(t, { addSuffix: true })}` : songs;
}

// A user's public profile: who they are and the playlists they made public.
export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data: me } = useQuery({ queryKey: qk.me, queryFn: getMe });
  const profileQuery = useQuery({ queryKey: qk.profile(username), queryFn: () => getProfile(username) });
  const profile = profileQuery.data;
  const isMe = !!me && !!profile && me.username.toLowerCase() === profile.username.toLowerCase();
  const notFound = profileQuery.error instanceof ApiError && profileQuery.error.status === 404;

  return (
    <>
      <PageHeader title={profile?.display_name ?? "Profile"} backHref="/prototype/people" />

      {profileQuery.isPending ? (
        <div className="flex flex-col items-center gap-3 p-4 pt-6">
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      ) : profileQuery.isError || !profile ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{notFound ? "User not found" : "Profile unavailable"}</EmptyTitle>
            <EmptyDescription>
              {notFound ? `No one goes by @${username}.` : errorMessage(profileQuery.error)}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" asChild>
              <Link href="/prototype/people">Find people</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-6 p-4">
          <div className="flex flex-col items-center gap-2 pt-2 text-center">
            <UserAvatar username={profile.username} avatarUrl={profile.avatar_url} className="size-20 text-2xl" />
            <div className="min-w-0 space-y-0.5">
              <p className="flex items-center justify-center gap-1.5 font-semibold text-xl">
                <span className="truncate">{profile.display_name}</span>
                {profile.verified && <VerifiedBadge />}
              </p>
              <p className="truncate text-muted-foreground text-sm">@{profile.username}</p>
            </div>
            {isMe && (
              <p className="max-w-xs pt-1 text-muted-foreground text-xs">
                This is how others see your profile. Only your public playlists appear here.
              </p>
            )}
          </div>

          <section className="space-y-2">
            <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Public playlists</h2>
            {profile.playlists.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <ListMusic className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-2 font-medium text-sm">No public playlists yet</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {isMe
                    ? "Choose “Make public” from a playlist’s ⋮ menu to show it here."
                    : `@${profile.username} hasn’t shared a playlist publicly.`}
                </p>
                {isMe && (
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/prototype/playlists">Go to my playlists</Link>
                  </Button>
                )}
              </div>
            ) : (
              <ul className="divide-y rounded-xl border">
                {profile.playlists.map((p) => (
                  <li key={p.id}>
                    <Link href={`/prototype/playlists/${p.id}`} className="flex items-center gap-3 px-3 py-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <ListMusic className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.playlist_name}</span>
                        <span className="block truncate text-muted-foreground text-sm">{playlistMeta(p)}</span>
                      </span>
                      <Globe aria-label="Public" className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
