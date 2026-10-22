"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { ListMusic, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../_components/page-header";
import { PlaylistActions } from "../../_components/playlist-actions";
import { PlaylistNameDialog } from "../../_components/playlist-name-dialog";
import { errorMessage, qk } from "../../_lib/api";
import { createPlaylist, listPlaylists } from "../../_lib/playlists";
import type { PlaylistSummary } from "../../_lib/types";

type SortKey = "recent" | "name" | "songs";

const timeOf = (p: PlaylistSummary) => new Date(p.updatedAt || p.createdAt).getTime() || 0;

const SORTERS: Record<SortKey, (a: PlaylistSummary, b: PlaylistSummary) => number> = {
  recent: (a, b) => timeOf(b) - timeOf(a),
  name: (a, b) => a.playlist_name.localeCompare(b.playlist_name, undefined, { sensitivity: "base", numeric: true }),
  songs: (a, b) => (b.songs?.length ?? 0) - (a.songs?.length ?? 0),
};

function updatedLabel(p: PlaylistSummary) {
  const t = timeOf(p);
  return t ? `Updated ${formatDistanceToNowStrict(t, { addSuffix: true })}` : "Recently";
}

export default function PlaylistsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [creating, setCreating] = useState(false);

  const { data, isPending, isError, error } = useQuery({ queryKey: qk.playlists, queryFn: listPlaylists });

  const needle = filter.trim().toLowerCase();
  const playlists = (data ?? []).filter((p) => p.playlist_name.toLowerCase().includes(needle)).sort(SORTERS[sort]);

  async function create(name: string) {
    const pl = await createPlaylist(name);
    toast.success("Playlist created");
    await queryClient.invalidateQueries({ queryKey: qk.playlists });
    router.push(`/prototype/playlists/${pl.id}`);
  }

  return (
    <>
      <PageHeader
        title="Playlists"
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus />
            New
          </Button>
        }
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Find a playlist"
              aria-label="Find a playlist"
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-36" aria-label="Sort playlists">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="recent">Recently updated</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="songs">Most songs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      {isPending ? (
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="p-4 text-destructive text-sm">{errorMessage(error)}</p>
      ) : playlists.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListMusic />
            </EmptyMedia>
            <EmptyTitle>{needle ? "No matching playlists" : "No playlists yet"}</EmptyTitle>
            <EmptyDescription>
              {needle ? "Try a different name." : "Create a playlist for your next service or rehearsal."}
            </EmptyDescription>
          </EmptyHeader>
          {!needle && (
            <EmptyContent>
              <Button onClick={() => setCreating(true)}>
                <Plus />
                New playlist
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <ul className="divide-y">
          {playlists.map((p) => (
            <li key={p.id} className="flex items-center gap-1 pr-2">
              <Link href={`/prototype/playlists/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ListMusic className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.playlist_name}</span>
                  <span className="block truncate text-muted-foreground text-sm">
                    {p.songs?.length ?? 0} songs · {updatedLabel(p)}
                  </span>
                </span>
                {p.access_type !== "owner" && <Badge variant="secondary">Joined</Badge>}
              </Link>
              {p.access_type === "owner" && <PlaylistActions playlist={p} />}
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <PlaylistNameDialog
          title="New playlist"
          submitLabel="Create"
          onSubmit={create}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  );
}
