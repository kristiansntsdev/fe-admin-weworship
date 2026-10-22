"use client";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical, Pencil, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { errorMessage, qk } from "../_lib/api";
import { deletePlaylist, renamePlaylist } from "../_lib/playlists";
import type { PlaylistSummary } from "../_lib/types";
import { ConfirmDialog } from "./confirm-dialog";
import { PlaylistNameDialog } from "./playlist-name-dialog";
import { ShareSheet } from "./share-sheet";

// Owner-only menu: rename, share, delete. Used on the playlist list rows and the playlist detail header.
export function PlaylistActions({
  playlist,
  onDeleted,
}: {
  playlist: Pick<PlaylistSummary, "id" | "playlist_name">;
  onDeleted?: () => void;
}) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<"rename" | "share" | "delete" | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => deletePlaylist(playlist.id),
    onSuccess: () => {
      setDialog(null);
      toast.success("Playlist deleted");
      queryClient.removeQueries({ queryKey: qk.playlist(playlist.id) });
      queryClient.invalidateQueries({ queryKey: qk.playlists });
      onDeleted?.();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  async function rename(name: string) {
    await renamePlaylist(playlist.id, name);
    toast.success("Playlist renamed");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.playlists }),
      queryClient.invalidateQueries({ queryKey: qk.playlist(playlist.id) }),
    ]);
  }

  return (
    <>
      {/* modal={false}: avoids Radix leaving pointer-events locked when a dialog opens from the menu */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Playlist actions">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDialog("rename")}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog("share")}>
            <Share2 />
            Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialog === "rename" && (
        <PlaylistNameDialog
          title="Rename playlist"
          submitLabel="Save"
          initialName={playlist.playlist_name}
          onSubmit={rename}
          onClose={() => setDialog(null)}
        />
      )}

      <ShareSheet
        playlistId={playlist.id}
        playlistName={playlist.playlist_name}
        open={dialog === "share"}
        onOpenChange={(open) => !open && setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Delete “${playlist.playlist_name}”?`}
        description="This removes the playlist for everyone who joined it. This can't be undone."
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
