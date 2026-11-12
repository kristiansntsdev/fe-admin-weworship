"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Globe, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { errorMessage, qk } from "../_lib/api";
import {
  createShareLink,
  getPlaylist,
  publicUrl,
  publishPlaylist,
  shareUrl,
  unpublishPlaylist,
} from "../_lib/playlists";
import type { PlaylistDetail, PublicViewMode } from "../_lib/types";
import { ConfirmDialog } from "./confirm-dialog";

async function copyText(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  } catch {
    toast.error("Couldn't copy — select the link and copy it manually.");
  }
}

async function shareLink(url: string, title: string, text: string) {
  if (typeof navigator.share !== "function") return copyText(url);
  try {
    await navigator.share({ title, text, url });
  } catch {
    // User dismissed the share sheet.
  }
}

function ViewModePicker({
  value,
  onChange,
  disabled,
}: {
  value: PublicViewMode;
  onChange: (mode: PublicViewMode) => void;
  disabled?: boolean;
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={value}
      // Radix sends "" when the active item is clicked again — keep the current choice.
      onValueChange={(v) => v && onChange(v as PublicViewMode)}
      disabled={disabled}
      aria-label="What visitors see"
      className="w-full"
    >
      <ToggleGroupItem value="lyrics" className="flex-1">
        Lyrics only
      </ToggleGroupItem>
      <ToggleGroupItem value="lyrics_chords" className="flex-1">
        Lyrics + chords
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function LinkActions({
  url,
  title,
  text,
  children,
}: {
  url: string;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Link" />
      <Button onClick={() => shareLink(url, title, text)}>
        <Share2 />
        Share link
      </Button>
      <Button variant="outline" onClick={() => copyText(url)}>
        <Copy />
        Copy link
      </Button>
      {children}
    </div>
  );
}

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
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  // The owner's pick before publishing; once published the server value is what counts.
  const [draftMode, setDraftMode] = useState<PublicViewMode | null>(null);

  const playlistQuery = useQuery({
    queryKey: qk.playlist(playlistId),
    queryFn: () => getPlaylist(playlistId),
    enabled: open,
  });
  const playlist = playlistQuery.data;

  function patchPlaylist(patch: Partial<PlaylistDetail>) {
    queryClient.setQueryData<PlaylistDetail>(qk.playlist(playlistId), (prev) => (prev ? { ...prev, ...patch } : prev));
    queryClient.invalidateQueries({ queryKey: qk.playlists });
  }

  // Every call issues a new invite token and kills the old invite link.
  const inviteMutation = useMutation({
    mutationFn: () => createShareLink(playlistId),
    onSuccess: (res) => {
      patchPlaylist({ share_token: res.share_token, playlist_team_id: res.playlist_team_id, is_shared: true });
      setConfirmReset(false);
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const publishMutation = useMutation({
    mutationFn: ({ mode }: { mode: PublicViewMode; switching: boolean }) => publishPlaylist(playlistId, mode),
    onSuccess: (res, { switching }) => {
      patchPlaylist({ is_public: true, public_token: res.public_token, public_view_mode: res.public_view_mode });
      setDraftMode(null);
      toast.success(switching ? "Display mode updated" : "Playlist published");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishPlaylist(playlistId),
    onSuccess: () => {
      patchPlaylist({ is_public: false });
      setConfirmUnpublish(false);
      toast.success("Playlist unpublished");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const published = !!playlist?.is_public && !!playlist.public_token;
  const mode: PublicViewMode = published
    ? (playlist?.public_view_mode ?? "lyrics_chords")
    : (draftMode ?? playlist?.public_view_mode ?? "lyrics_chords");
  const pubUrl = published && playlist?.public_token ? publicUrl(playlist.public_token) : null;
  const inviteUrl = playlist?.share_token ? shareUrl(playlist.share_token) : null;

  const loading = playlistQuery.isPending;
  const failed = playlistQuery.isError;

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md pb-4">
            <DrawerHeader className="text-left">
              <DrawerTitle>Share “{playlistName}”</DrawerTitle>
              <DrawerDescription>Publish it to the web, or invite people to edit it with you.</DrawerDescription>
            </DrawerHeader>

            <Tabs defaultValue="publish" className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="publish">
                  <Globe />
                  Publish
                </TabsTrigger>
                <TabsTrigger value="invite">
                  <Link2 />
                  Invite
                </TabsTrigger>
              </TabsList>

              <TabsContent value="publish" className="space-y-3 pt-2">
                {loading ? (
                  <Skeleton className="h-24 w-full" />
                ) : failed ? (
                  <p className="text-destructive text-sm">{errorMessage(playlistQuery.error)}</p>
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm">
                      {published
                        ? "This playlist is public. Anyone with the link can read it, no account needed."
                        : "Anyone with the link will be able to read this playlist, no account needed."}
                    </p>
                    <div className="space-y-1.5">
                      <p className="font-medium text-sm">What visitors see</p>
                      <ViewModePicker
                        value={mode}
                        disabled={publishMutation.isPending}
                        onChange={(next) => {
                          if (published) publishMutation.mutate({ mode: next, switching: true });
                          else setDraftMode(next);
                        }}
                      />
                      {mode === "lyrics" && (
                        <p className="text-muted-foreground text-xs">Chords are removed before the page is sent.</p>
                      )}
                    </div>

                    {pubUrl ? (
                      <LinkActions url={pubUrl} title={playlistName} text={`“${playlistName}” on WeWorship`}>
                        <Button
                          variant="ghost"
                          className="text-muted-foreground"
                          onClick={() => setConfirmUnpublish(true)}
                        >
                          Unpublish
                        </Button>
                      </LinkActions>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={publishMutation.isPending}
                        onClick={() => publishMutation.mutate({ mode, switching: false })}
                      >
                        <Globe />
                        {publishMutation.isPending ? "Publishing…" : "Publish"}
                      </Button>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="invite" className="space-y-3 pt-2">
                <p className="text-muted-foreground text-sm">
                  Anyone with this link can join the playlist after signing in.
                </p>
                {loading ? (
                  <Skeleton className="h-9 w-full" />
                ) : failed ? (
                  <p className="text-destructive text-sm">{errorMessage(playlistQuery.error)}</p>
                ) : inviteUrl ? (
                  <LinkActions url={inviteUrl} title={playlistName} text={`Join "${playlistName}" on WeWorship`}>
                    <Button variant="ghost" className="text-muted-foreground" onClick={() => setConfirmReset(true)}>
                      Reset link
                    </Button>
                  </LinkActions>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => inviteMutation.mutate()}
                    disabled={inviteMutation.isPending}
                  >
                    <Link2 />
                    {inviteMutation.isPending ? "Creating…" : "Create invite link"}
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset invite link?"
        description="The current link will stop working. People who already joined keep their access."
        confirmLabel="Reset link"
        pending={inviteMutation.isPending}
        onConfirm={() => inviteMutation.mutate()}
      />

      <ConfirmDialog
        open={confirmUnpublish}
        onOpenChange={setConfirmUnpublish}
        title="Unpublish this playlist?"
        description="The public link will stop working and the playlist becomes private. Publishing again brings the same link back."
        confirmLabel="Unpublish"
        pending={unpublishMutation.isPending}
        onConfirm={() => unpublishMutation.mutate()}
      />
    </>
  );
}
