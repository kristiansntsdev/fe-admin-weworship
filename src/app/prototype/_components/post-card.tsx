"use client";

import Link from "next/link";

import { formatDistanceToNowStrict } from "date-fns";
import { Copy, Heart, ListMusic, Youtube } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CommunityPost } from "../_lib/community";

export function PostCard({
  post,
  onToggleLike,
}: {
  post: CommunityPost;
  onToggleLike?: (postId: string) => void;
}) {
  const time = (() => {
    const t = +new Date(post.createdAt);
    return t ? formatDistanceToNowStrict(t, { addSuffix: true }) : "";
  })();

  const detailHref = `/prototype/community/${post.id}`;

  return (
    <article className="space-y-3 border-b px-4 py-4">
      <Link href={detailHref} className="block space-y-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <header className="flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm">{post.authorName}</p>
            <p className="truncate text-muted-foreground text-xs">@{post.authorHandle}</p>
          </div>
          {time && <time className="shrink-0 text-muted-foreground text-xs">{time}</time>}
        </header>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 font-normal">
            <ListMusic className="size-3.5" />
            <span className="max-w-[12rem] truncate">{post.playlistName}</span>
            <span className="text-muted-foreground">· {post.songCount}</span>
          </Badge>

          {post.youtubePlaylistUrl && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <Youtube className="size-3.5" />
              YouTube playlist
            </span>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("gap-1.5 px-2", post.likedByMe && "text-primary")}
          aria-pressed={post.likedByMe}
          aria-label={post.likedByMe ? "Unlike" : "Like"}
          onClick={(e) => {
            e.preventDefault();
            onToggleLike?.(post.id);
          }}
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
        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground text-xs" asChild>
          <Link href={detailHref}>View songs</Link>
        </Button>
      </div>
    </article>
  );
}
