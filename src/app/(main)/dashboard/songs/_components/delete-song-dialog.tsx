"use client";

import { useState } from "react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import type { Song } from "../page";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: Song | null;
  onSuccess: () => void;
}

export function DeleteSongDialog({ open, onOpenChange, song, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!song) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/songs/${song.id}`, { method: "DELETE", credentials: "include" });
      onOpenChange(false);
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Song</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{song?.title}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
