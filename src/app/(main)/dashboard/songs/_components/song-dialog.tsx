"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { Song } from "../page";
import { SongForm } from "./song-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song?: Song;
  onSuccess: () => void;
}

export function SongDialog({ open, onOpenChange, song, onSuccess }: Props) {
  function handleSuccess() {
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{song ? "Edit Song" : "Add Song"}</DialogTitle>
        </DialogHeader>
        <SongForm
          song={song}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
