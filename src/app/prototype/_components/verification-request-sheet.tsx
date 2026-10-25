"use client";

import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";

import { errorMessage, qk } from "../_lib/api";
import { createVerificationRequest } from "../_lib/verification";

export function VerificationRequestSheet({
  open,
  onOpenChange,
  rejectNote,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectNote?: string | null;
}) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDisplayName("");
    setProofLink("");
    setNote("");
  }, [open]);

  async function submit() {
    const name = displayName.trim();
    const link = proofLink.trim();
    if (!name) {
      toast.error("Enter your ministry or display name.");
      return;
    }
    if (!/^https?:\/\/\S+$/i.test(link)) {
      toast.error("Proof link must start with http:// or https://");
      return;
    }
    setSubmitting(true);
    try {
      await createVerificationRequest({
        display_name: name,
        proof_link: link,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      toast.success("Request submitted — we’ll review it soon.");
      await queryClient.invalidateQueries({ queryKey: qk.verificationMe });
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="text-left">
            <DrawerTitle>Request official account</DrawerTitle>
            <DrawerDescription>
              Staff will check that this is really your ministry or artist account. Add a public proof link
              (YouTube channel, Instagram, church site).
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-2">
            {rejectNote ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive text-sm">
                Previous review: {rejectNote}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="vr-name">Display / ministry name</Label>
              <Input
                id="vr-name"
                placeholder="e.g. JPCC Worship"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vr-proof">Proof link</Label>
              <Input
                id="vr-proof"
                type="url"
                inputMode="url"
                placeholder="https://youtube.com/@…"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vr-note">Note (optional)</Label>
              <Textarea
                id="vr-note"
                rows={3}
                placeholder="Anything that helps us confirm this is you"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
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
