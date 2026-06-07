"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type EditableRole = "user" | "maintainer";

interface UserRoleToggleProps {
  userId: number;
  initialRole: EditableRole;
}

const ROLE_LABELS: Record<EditableRole, string> = {
  user: "User",
  maintainer: "Maintainer",
};

export function UserRoleToggle({ userId, initialRole }: UserRoleToggleProps) {
  const router = useRouter();
  const [role, setRole] = useState<EditableRole>(initialRole);
  const [isPending, startTransition] = useTransition();

  function updateRole(nextRole: string) {
    if (nextRole !== "user" && nextRole !== "maintainer") return;
    if (nextRole === role) return;

    const previousRole = role;
    setRole(nextRole);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: nextRole }),
        });
        const body = await res.json().catch(() => ({ message: res.statusText }));
        if (!res.ok) {
          throw new Error(body.message ?? "Failed to update user role");
        }
        toast.success(`Role changed to ${ROLE_LABELS[nextRole]}`);
        router.refresh();
      } catch (error) {
        setRole(previousRole);
        toast.error(error instanceof Error ? error.message : "Failed to update user role");
      }
    });
  }

  return (
    <ToggleGroup
      type="single"
      value={role}
      onValueChange={updateRole}
      variant="outline"
      size="sm"
      className="min-w-[184px]"
      aria-label="User role"
      disabled={isPending}
    >
      <ToggleGroupItem value="user" className="min-w-[72px]">
        User
      </ToggleGroupItem>
      <ToggleGroupItem value="maintainer" className="min-w-[104px]">
        Maintainer
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
