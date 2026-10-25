import Link from "next/link";

import { formatDistanceToNowStrict } from "date-fns";
import { ListMusic, Youtube } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { CommunityPost } from "../_lib/community";

export function PostCard({ post }: { post: CommunityPost }) {
  const time = (() => {
    const t = +new Date(post.createdAt);
    return t ? formatDistanceToNowStrict(t, { addSuffix: true }) : "";
  })();

  const playlistHref = post.playlistId > 0 ? `/prototype/playlists/${post.playlistId}` : undefined;

  return (
    <article className="space-y-3 border-b px-4 py-4">
      <header className="flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm">{post.authorName}</p>
          <p className="truncate text-muted-foreground text-xs">@{post.authorHandle}</p>
        </div>
        {time && <time className="shrink-0 text-muted-foreground text-xs">{time}</time>}
      </header>

      <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        {playlistHref ? (
          <Badge variant="secondary" asChild className="gap-1.5 font-normal">
            <Link href={playlistHref}>
              <ListMusic className="size-3.5" />
              <span className="max-w-[12rem] truncate">{post.playlistName}</span>
              <span className="text-muted-foreground">· {post.songCount}</span>
            </Link>
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1.5 font-normal">
            <ListMusic className="size-3.5" />
            <span className="max-w-[12rem] truncate">{post.playlistName}</span>
            <span className="text-muted-foreground">· {post.songCount}</span>
          </Badge>
        )}

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
    </article>
  );
}
