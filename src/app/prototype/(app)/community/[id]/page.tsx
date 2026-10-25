"use client";

import { use, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Copy, Heart, ListMusic, Youtube } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

import { PageHeader } from "../../../_components/page-header";
import { errorMessage, qk } from "../../../_lib/api";
import { type CommunityPost, getPost, incrementCopyCount, toggleLike } from "../../../_lib/community";
import { addSongs, createPlaylist } from "../../../_lib/playlists";
import { prototypeLoginHref, usePrototypeSignedIn } from "../../../_lib/session";

export default function CommunityPostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const signedIn = usePrototypeSignedIn();
  const [post, setPost] = useState<CommunityPost | null | undefined>(undefined);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setPost(getPost(id) ?? null);
  }, [id]);

  function onLike() {
    const next = toggleLike(id);
    setPost(next.find((p) => p.id === id) ?? null);
  }

  async function onCopyPlaylist() {
    if (!post) return;
    if (!signedIn) {
      router.push(prototypeLoginHref(`/prototype/community/${id}`));
      return;
    }
    setCopying(true);
    try {
      const name = `${post.playlistName} (copy)`;
      const created = await createPlaylist(name);
      const realIds = post.songs.map((s) => s.id).filter((sid): sid is number => typeof sid === "number" && sid > 0);
      if (realIds.length > 0) {
        await addSongs(created.id, realIds);
        toast.success(`Copied “${name}” with ${realIds.length} songs`);
      } else {
        // Demo / seed songs have no catalog ids — empty playlist still lands in their library.
        toast.success(`Created “${name}” — demo songs weren’t copied to the catalog`);
      }
      const next = incrementCopyCount(id);
      setPost(next.find((p) => p.id === id) ?? post);
      await queryClient.invalidateQueries({ queryKey: qk.playlists });
      router.push(`/prototype/playlists/${created.id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCopying(false);
    }
  }

  if (post === undefined) return null;

  if (!post) {
    return (
      <>
        <PageHeader title="Post" backHref="/prototype/community" />
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Post not found</EmptyTitle>
            <EmptyDescription>It may have been cleared from this browser’s mock feed.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" asChild>
              <Link href="/prototype/community">Back to Community</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </>
    );
  }

  const time = (() => {
    const t = +new Date(post.createdAt);
    return t ? formatDistanceToNowStrict(t, { addSuffix: true }) : "";
  })();

  return (
    <>
      <PageHeader
        title="Post"
        backHref="/prototype/community"
        actions={
          <Button size="sm" onClick={onCopyPlaylist} disabled={copying}>
            <Copy />
            {copying ? "Copying…" : "Copy playlist"}
          </Button>
        }
      />

      <div className="space-y-4 px-4 py-4">
        <header className="flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">{post.authorName}</p>
            <p className="truncate text-muted-foreground text-sm">
              @{post.authorHandle}
              {time ? ` · ${time}` : ""}
            </p>
          </div>
        </header>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 font-normal">
            <ListMusic className="size-3.5" />
            <span className="max-w-[14rem] truncate">{post.playlistName}</span>
            <span className="text-muted-foreground">· {post.songs.length}</span>
          </Badge>
          {post.youtubePlaylistUrl && (
            <a
              href={post.youtubePlaylistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline"
            >
              <Youtube className="size-3.5" />
              YouTube playlist
            </a>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("gap-1.5 px-2", post.likedByMe && "text-primary")}
            aria-pressed={post.likedByMe}
            onClick={onLike}
          >
            <Heart className={cn("size-4", post.likedByMe && "fill-current")} />
            <span className="tabular-nums text-xs">{post.likeCount}</span>
          </Button>
          <span
            className="inline-flex items-center gap-1.5 px-2 text-muted-foreground"
            title="Playlist copies"
            aria-label={`${post.copyCount} playlist copies`}
          >
            <Copy className="size-4" />
            <span className="tabular-nums text-xs">{post.copyCount}</span>
          </span>
        </div>
      </div>

      <section className="border-t">
        <h2 className="px-4 pt-4 pb-1 font-semibold text-sm">Songs in playlist</h2>
        {post.songs.length === 0 ? (
          <p className="px-4 py-6 text-muted-foreground text-sm">No songs on this playlist yet.</p>
        ) : (
          <ol className="divide-y">
            {post.songs.map((song, i) => (
              <li key={`${song.id ?? song.title}-${i}`} className="flex items-center gap-3 px-4 py-3">
                <span className="w-5 shrink-0 text-center text-muted-foreground text-xs tabular-nums">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{song.title}</p>
                  <p className="truncate text-muted-foreground text-xs">{song.artist || "Unknown artist"}</p>
                </div>
                {song.key && (
                  <Badge variant="outline" className="shrink-0 font-mono">
                    {song.key}
                  </Badge>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
