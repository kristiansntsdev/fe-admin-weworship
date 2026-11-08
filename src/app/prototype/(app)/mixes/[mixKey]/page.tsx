"use client";

import { use, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ListPlus, Play } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { MixCover } from "../../../_components/mix-shelf";
import { PageHeader } from "../../../_components/page-header";
import { errorMessage, qk } from "../../../_lib/api";
import { mixHref, useMix } from "../../../_lib/mixes";
import { addSongs, createPlaylist } from "../../../_lib/playlists";

export default function MixPage({ params }: { params: Promise<{ mixKey: string }> }) {
  const { mixKey } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mix, isPending, error } = useMix(mixKey);
  const [saving, setSaving] = useState(false);

  const playHref = `${mixHref(mixKey)}/play`;

  // The list renders from the mix's own snapshot rather than fetching each song, because GET /songs/:id
  // records a view — and views feed back into the next mixes.
  async function saveAsPlaylist() {
    if (!mix) return;
    setSaving(true);
    try {
      const name = `${mix.title} · ${format(new Date(), "d MMM")}`;
      const playlist = await createPlaylist(name, false);
      await addSongs(
        playlist.id,
        mix.songs.map((s) => s.id),
      );
      toast.success(`Saved as “${name}”`);
      await queryClient.invalidateQueries({ queryKey: qk.playlists });
      router.push(`/prototype/playlists/${playlist.id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title={mix?.title ?? "Mix"} backHref="/prototype/home" />

      {isPending ? (
        <div className="space-y-4 p-4">
          <div className="flex gap-4">
            <Skeleton className="size-28 rounded-xl" />
            <div className="flex-1 space-y-2 pt-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error || !mix ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Mix unavailable</EmptyTitle>
            <EmptyDescription>{errorMessage(error)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" asChild>
              <Link href="/prototype/home">Back to home</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="space-y-4 border-b p-4">
            <div className="flex items-end gap-4">
              <MixCover mix={mix} className="w-28 shrink-0" />
              <div className="min-w-0 pb-1">
                <h2 className="font-semibold text-xl tracking-tight">{mix.title}</h2>
                {mix.subtitle && <p className="line-clamp-2 text-muted-foreground text-sm">{mix.subtitle}</p>}
                <p className="pt-1 text-muted-foreground text-xs">
                  {mix.songs.length} song{mix.songs.length === 1 ? "" : "s"} · Refreshes daily
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {mix.songs.length > 0 ? (
                <Button className="flex-1" asChild>
                  <Link href={playHref}>
                    <Play />
                    Play
                  </Link>
                </Button>
              ) : (
                <Button className="flex-1" disabled>
                  <Play />
                  Play
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                disabled={saving || mix.songs.length === 0}
                onClick={saveAsPlaylist}
              >
                <ListPlus />
                {saving ? "Saving…" : "Save as playlist"}
              </Button>
            </div>
          </div>

          {mix.songs.length === 0 ? (
            <p className="p-4 text-muted-foreground text-sm">No songs match this mix yet.</p>
          ) : (
            <ol className="divide-y">
              {mix.songs.map((s, i) => (
                <li key={s.id}>
                  <Link href={`${playHref}?i=${i}`} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-5 shrink-0 text-right text-muted-foreground text-sm tabular-nums">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{s.title}</span>
                      <span className="block truncate text-muted-foreground text-sm">
                        {s.artist || "Unknown artist"}
                      </span>
                    </span>
                    {s.key && (
                      <Badge variant="outline" className="shrink-0 font-mono">
                        {s.key}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </>
  );
}
