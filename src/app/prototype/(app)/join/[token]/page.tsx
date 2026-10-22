"use client";

import { use } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2Off, ListMusic } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../../_components/page-header";
import { errorMessage, qk } from "../../../_lib/api";
import { getPlaylistPreview, joinPlaylist } from "../../../_lib/playlists";

// Landing page for shared links (/prototype/join/<share_token>). Logged-out visitors are sent to login by the
// route guard and returned here afterwards, so the invite is never lost.
export default function JoinPlaylistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const previewQuery = useQuery({ queryKey: qk.playlistPreview(token), queryFn: () => getPlaylistPreview(token) });
  const preview = previewQuery.data;

  const joinMutation = useMutation({
    mutationFn: () => joinPlaylist(token),
    onSuccess: async ({ playlist_id }) => {
      toast.success(`Joined “${preview?.playlist_name ?? "playlist"}”`);
      await queryClient.invalidateQueries({ queryKey: qk.playlists });
      router.replace(`/prototype/playlists/${playlist_id}`);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <>
      <PageHeader title="Join playlist" backHref="/prototype/playlists" />

      {previewQuery.isPending ? (
        <div className="flex flex-col items-center gap-3 p-8">
          <Skeleton className="size-16 rounded-xl" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      ) : previewQuery.isError || !preview ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Link2Off />
            </EmptyMedia>
            <EmptyTitle>Link expired</EmptyTitle>
            <EmptyDescription>
              This share link is no longer valid. Ask the playlist owner to send you a new one.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" asChild>
              <Link href="/prototype/playlists">Go to my playlists</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col items-center gap-6 px-6 py-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ListMusic className="size-8" />
          </span>
          <div className="space-y-1">
            <h2 className="font-semibold text-xl">{preview.playlist_name}</h2>
            <p className="text-muted-foreground text-sm">Created by {preview.owner_name}</p>
            <p className="text-muted-foreground text-sm">
              {preview.song_count} song{preview.song_count === 1 ? "" : "s"} · {preview.member_count} member
              {preview.member_count === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <Button size="lg" onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
              {joinMutation.isPending ? "Joining…" : "Join playlist"}
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/prototype/playlists">Maybe later</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
