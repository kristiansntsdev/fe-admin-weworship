"use client";

import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { qk } from "../_lib/api";
import {
  type CommunityPost,
  type CommunitySong,
  isYoutubePlaylistUrl,
  MOCK_PLAYLISTS,
  savePost,
  songsForMockPlaylist,
} from "../_lib/community";
import { getPlaylist, listPlaylists } from "../_lib/playlists";
import { usePrototypeSignedIn } from "../_lib/session";
import { artistLabel, getMe, getSong } from "../_lib/songs";

type PlaylistChoice = { id: number; name: string; songCount: number };

async function snapshotSongs(playlistId: number, songCount: number): Promise<CommunitySong[]> {
  if (playlistId < 0) return songsForMockPlaylist(playlistId);
  try {
    const pl = await getPlaylist(playlistId);
    const ids = pl.songs ?? [];
    const songs = await Promise.all(
      ids.map(async (sid) => {
        try {
          const s = await getSong(sid);
          return {
            id: s.id,
            title: s.title,
            artist: artistLabel(s.artist) || "Unknown artist",
            key: pl.song_keys?.[String(sid)] ?? s.base_chord,
          } satisfies CommunitySong;
        } catch {
          return { id: sid, title: `Song #${sid}`, artist: "", key: pl.song_keys?.[String(sid)] ?? null };
        }
      }),
    );
    return songs;
  } catch {
    return Array.from({ length: songCount }, (_, i) => ({
      title: `Song ${i + 1}`,
      artist: "",
      key: null,
    }));
  }
}

export function CreatePostSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (posts: CommunityPost[]) => void;
}) {
  const signedIn = usePrototypeSignedIn();
  const [description, setDescription] = useState("");
  const [playlistKey, setPlaylistKey] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ytError, setYtError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Guests skip API calls — protoFetch 401 would bounce them to login.
  const meQuery = useQuery({ queryKey: qk.me, queryFn: getMe, enabled: open && signedIn, retry: false });
  const playlistsQuery = useQuery({
    queryKey: qk.playlists,
    queryFn: listPlaylists,
    enabled: open && signedIn,
    retry: false,
  });

  const choices: PlaylistChoice[] = useMemo(() => {
    const api = playlistsQuery.data ?? [];
    if (api.length > 0) {
      return api.map((p) => ({
        id: p.id,
        name: p.playlist_name,
        songCount: p.songs?.length ?? 0,
      }));
    }
    return MOCK_PLAYLISTS.map((p) => ({ id: p.id, name: p.playlist_name, songCount: p.songCount }));
  }, [playlistsQuery.data]);

  useEffect(() => {
    if (!open) return;
    setDescription("");
    setYoutubeUrl("");
    setYtError(null);
    setPlaylistKey("");
  }, [open]);

  // Once choices load, default to the first playlist if nothing selected.
  useEffect(() => {
    if (!open || playlistKey || choices.length === 0) return;
    setPlaylistKey(String(choices[0].id));
  }, [open, choices, playlistKey]);

  async function submit() {
    const caption = description.trim();
    if (!caption) {
      toast.error("Write a short caption for your playlist.");
      return;
    }
    const choice = choices.find((c) => String(c.id) === playlistKey);
    if (!choice) {
      toast.error("Pick a playlist.");
      return;
    }
    const yt = youtubeUrl.trim();
    if (yt && !isYoutubePlaylistUrl(yt)) {
      setYtError("Use a YouTube playlist link (with list=…).");
      return;
    }
    setYtError(null);
    setSubmitting(true);
    try {
      const me = meQuery.data;
      const songs = await snapshotSongs(choice.id, choice.songCount);
      const post: CommunityPost = {
        id: `local-${Date.now()}`,
        authorName: me?.username ?? "You",
        authorHandle: me?.username ?? "you",
        description: caption,
        playlistId: choice.id,
        playlistName: choice.name,
        songCount: songs.length || choice.songCount,
        songs,
        likeCount: 0,
        likedByMe: false,
        ...(yt ? { youtubePlaylistUrl: yt } : {}),
        createdAt: new Date().toISOString(),
      };
      const next = savePost(post);
      onCreated(next);
      toast.success("Posted to Community");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle>Share a playlist</DrawerTitle>
            <DrawerDescription>
              Tell people why this setlist matters — add a YouTube playlist link if you have one.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-2">
              <Label htmlFor="post-caption">Caption</Label>
              <Textarea
                id="post-caption"
                rows={3}
                placeholder="Playlist disaat aku lagi sedih"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Playlist</Label>
              <Select value={playlistKey} onValueChange={setPlaylistKey}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a playlist" />
                </SelectTrigger>
                <SelectContent>
                  {choices.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} · {c.songCount} songs
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-youtube">YouTube playlist (optional)</Label>
              <Input
                id="post-youtube"
                type="url"
                inputMode="url"
                placeholder="https://youtube.com/playlist?list=…"
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  setYtError(null);
                }}
              />
              {ytError && <p className="text-destructive text-sm">{ytError}</p>}
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={submit} disabled={submitting || !playlistKey}>
              {submitting ? "Posting…" : "Post"}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
