"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function UserVerifiedToggle({ userId, initialVerified }: { userId: number; initialVerified: boolean }) {
  const router = useRouter();
  const [verified, setVerified] = useState(initialVerified);
  const [isPending, startTransition] = useTransition();

  function onCheckedChange(next: boolean) {
    const previous = verified;
    setVerified(next);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/verified`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verified: next }),
        });
        const body = await res.json().catch(() => ({ message: res.statusText }));
        if (!res.ok) throw new Error(body.message ?? "Failed to update verification");
        toast.success(next ? "Marked as verified" : "Verification removed");
        router.refresh();
      } catch (error) {
        setVerified(previous);
        toast.error(error instanceof Error ? error.message : "Failed to update verification");
      }
    });
  }

  return (
    <label className={cn("inline-flex items-center gap-2", isPending && "opacity-60")}>
      <Switch checked={verified} onCheckedChange={onCheckedChange} disabled={isPending} aria-label="Official verified" />
      <BadgeCheck className={cn("size-4", verified ? "text-primary" : "text-muted-foreground")} />
    </label>
  );
}
