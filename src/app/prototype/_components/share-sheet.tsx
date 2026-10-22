"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { errorMessage, qk } from "../_lib/api";
import { createShareLink, getPlaylist, shareUrl } from "../_lib/playlists";
import type { PlaylistDetail } from "../_lib/types";
import { ConfirmDialog } from "./confirm-dialog";

export function ShareSheet({
  playlistId,
  playlistName,
  open,
  onOpenChange,
}: {
  playlistId: number;
  playlistName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [confirmReset, setConfirmReset] = useState(false);

  const playlistQuery = useQuery({
    queryKey: qk.playlist(playlistId),
    queryFn: () => getPlaylist(playlistId),
    enabled: open,
  });

  // Reuses the existing token when there is one — every call issues a new token and kills old links.
  const linkMutation = useMutation({
    mutationFn: () => createShareLink(playlistId),
    onSuccess: (res) => {
      queryClient.setQueryData<PlaylistDetail>(qk.playlist(playlistId), (prev) =>
        prev
          ? { ...prev, share_token: res.share_token, playlist_team_id: res.playlist_team_id, is_shared: true }
          : prev,
      );
      setConfirmReset(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const token = playlistQuery.data?.share_token;
  const url = token ? shareUrl(token) : null;

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually.");
    }
  }

  async function shareLink() {
    if (!url) return;
    if (typeof navigator.share !== "function") return copyLink();
    try {
      await navigator.share({ title: playlistName, text: `Join "${playlistName}" on WeWorship`, url });
    } catch {
      // User dismissed the share sheet.
    }
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader className="text-left">
              <DrawerTitle>Share “{playlistName}”</DrawerTitle>
              <DrawerDescription>Anyone with the link can join this playlist after signing in.</DrawerDescription>
            </DrawerHeader>

            <div className="px-4">
              {playlistQuery.isPending ? (
                <Skeleton className="h-9 w-full" />
              ) : playlistQuery.isError ? (
                <p className="text-destructive text-sm">{errorMessage(playlistQuery.error)}</p>
              ) : url ? (
                <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Share link" />
              ) : (
                <p className="text-muted-foreground text-sm">This playlist doesn't have a share link yet.</p>
              )}
            </div>

            <DrawerFooter>
              {url ? (
                <>
                  <Button onClick={shareLink}>
                    <Share2 />
                    Share link
                  </Button>
                  <Button variant="outline" onClick={copyLink}>
                    <Copy />
                    Copy link
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground" onClick={() => setConfirmReset(true)}>
                    Reset link
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => linkMutation.mutate()}
                  disabled={linkMutation.isPending || playlistQuery.isPending || playlistQuery.isError}
                >
                  <Link2 />
                  {linkMutation.isPending ? "Creating…" : "Create share link"}
                </Button>
              )}
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset share link?"
        description="The current link will stop working. People who already joined keep their access."
        confirmLabel="Reset link"
        pending={linkMutation.isPending}
        onConfirm={() => linkMutation.mutate()}
      />
    </>
  );
}
