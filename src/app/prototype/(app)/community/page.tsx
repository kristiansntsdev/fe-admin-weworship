"use client";

import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Newspaper, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

import { CreatePostSheet } from "../../_components/create-post-sheet";
import { PageHeader } from "../../_components/page-header";
import { PostCard } from "../../_components/post-card";
import { qk } from "../../_lib/api";
import { type CommunityPost, loadPosts, mergeCommunityFeed, toggleLike } from "../../_lib/community";
import { getHomeStats } from "../../_lib/home";

export default function CommunityPage() {
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const { data: stats } = useQuery({ queryKey: qk.home, queryFn: getHomeStats });

  useEffect(() => {
    setLocalPosts(loadPosts());
    setReady(true);
  }, []);

  const posts = useMemo(
    () => mergeCommunityFeed(localPosts, stats?.recent_songs ?? []),
    [localPosts, stats?.recent_songs],
  );

  function onToggleLike(postId: string) {
    if (postId.startsWith("new-song-")) return;
    setLocalPosts(toggleLike(postId));
  }

  return (
    <>
      <PageHeader
        title="Community"
        actions={
          <Button size="sm" onClick={() => setComposeOpen(true)}>
            <Plus />
            Post
          </Button>
        }
      />

      {!ready ? null : posts.length === 0 ? (
        <Empty className="flex-1 border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Newspaper />
            </EmptyMedia>
            <EmptyTitle>No posts yet</EmptyTitle>
            <EmptyDescription>Share a playlist with a short story — others can find inspiration here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setComposeOpen(true)}>
              <Plus />
              Share a playlist
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onToggleLike={onToggleLike} />
          ))}
        </div>
      )}

      <CreatePostSheet open={composeOpen} onOpenChange={setComposeOpen} onCreated={setLocalPosts} />
    </>
  );
}
