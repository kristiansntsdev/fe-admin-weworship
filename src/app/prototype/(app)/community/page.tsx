"use client";

import { useEffect, useState } from "react";

import { Newspaper, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

import { CreatePostSheet } from "../../_components/create-post-sheet";
import { PageHeader } from "../../_components/page-header";
import { PostCard } from "../../_components/post-card";
import { type CommunityPost, loadPosts } from "../../_lib/community";

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPosts(loadPosts());
    setReady(true);
  }, []);

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
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <CreatePostSheet open={composeOpen} onOpenChange={setComposeOpen} onCreated={setPosts} />
    </>
  );
}
