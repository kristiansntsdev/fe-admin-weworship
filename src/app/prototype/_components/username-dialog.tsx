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

// Mount it only while open so the field starts from the current username. The BE enforces the full rules.
export function UsernameDialog({
  initialUsername,
  onSubmit,
  onClose,
}: {
  initialUsername: string;
  onSubmit: (username: string) => Promise<void>;
  onClose: () => void;
}) {
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const trimmed = username.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed) return;
    setPending(true);
    setError(null);
    try {
      await onSubmit(trimmed);
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
            <DialogTitle>Change username</DialogTitle>
            <DialogDescription>
              6–30 characters. Letters, numbers, periods, underscores and hyphens only.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Username"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={!trimmed || pending || trimmed === initialUsername}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
