"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { errorMessage } from "../_lib/api";
import { VisibilityToggle } from "./playlist-visibility";

// Shared by "New playlist" and "Rename". Mount it only while open so the field starts from initialName.
// withVisibility adds the Private / Public picker (new playlists only); it starts at Private.
export function PlaylistNameDialog({
  title,
  submitLabel,
  initialName = "",
  withVisibility = false,
  onSubmit,
  onClose,
}: {
  title: string;
  submitLabel: string;
  initialName?: string;
  withVisibility?: boolean;
  onSubmit: (name: string, isPublic: boolean) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const trimmed = name.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed) return;
    setPending(true);
    setError(null);
    try {
      await onSubmit(trimmed, isPublic);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">Enter a playlist name</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunday Service"
            maxLength={100}
            aria-label="Playlist name"
          />
          {withVisibility && <VisibilityToggle isPublic={isPublic} onChange={setIsPublic} disabled={pending} />}
          {error && <p className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={!trimmed || pending || trimmed === initialName}>
              {pending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
