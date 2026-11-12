import { cache } from "react";

import Link from "next/link";

import { Link2Off } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

import type { ApiEnvelope, PublishedPlaylist } from "../../prototype/_lib/types";
import { PublishedPlaylistView } from "../_components/published-playlist-view";

const BE = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

type Result = { status: "ok"; playlist: PublishedPlaylist } | { status: "missing" } | { status: "error" };

// One request per render, shared by generateMetadata and the page.
const load = cache(async (token: string): Promise<Result> => {
  try {
    const res = await fetch(`${BE}/api/playlists/public/${encodeURIComponent(token)}`, { cache: "no-store" });
    if (res.status === 404) return { status: "missing" };
    if (!res.ok) return { status: "error" };
    const body = (await res.json()) as ApiEnvelope<PublishedPlaylist>;
    return { status: "ok", playlist: body.data };
  } catch {
    return { status: "error" };
  }
});

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const result = await load(token);
  if (result.status !== "ok") return { title: "Playlist · WeWorship", robots: { index: false } };
  const { playlist } = result;
  const by = playlist.owner ? ` by @${playlist.owner.username}` : "";
  return {
    title: `${playlist.playlist_name} · WeWorship`,
    description: `${playlist.song_count} song${playlist.song_count === 1 ? "" : "s"}${by}`,
    // A shared link, not a page to find through search.
    robots: { index: false },
  };
}

export default async function PublishedPlaylistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await load(token);

  if (result.status === "ok") return <PublishedPlaylistView playlist={result.playlist} />;

  const missing = result.status === "missing";
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Link2Off />
        </EmptyMedia>
        <EmptyTitle>{missing ? "This playlist isn't published" : "Couldn't load this playlist"}</EmptyTitle>
        <EmptyDescription>
          {missing
            ? "The link may be wrong, or the owner stopped sharing it."
            : "Something went wrong on our side. Try again in a moment."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" asChild>
          <Link href="/prototype">Open WeWorship</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
