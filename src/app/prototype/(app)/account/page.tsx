"use client";

import { useState } from "react";

import Link from "next/link";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AtSign, ChevronRight, History, LayoutDashboard, LogOut, Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../_components/page-header";
import { UsernameDialog } from "../../_components/username-dialog";
import { errorMessage, qk } from "../../_lib/api";
import { prototypeChangeUsername } from "../../_lib/auth-actions";
import { getMe } from "../../_lib/songs";
import type { Me } from "../../_lib/types";

export default function AccountPage() {
  const queryClient = useQueryClient();
  const [renaming, setRenaming] = useState(false);
  const { data: me, isPending, isError, error } = useQuery({ queryKey: qk.me, queryFn: getMe });

  async function changeUsername(username: string) {
    const result = await prototypeChangeUsername(username);
    if ("error" in result) throw new Error(result.error);
    queryClient.setQueryData<Me>(qk.me, (prev) => (prev ? { ...prev, username: result.username } : prev));
    toast.success("Username updated");
  }

  return (
    <>
      <PageHeader title="Account" />

      <div className="space-y-6 p-4">
        {isPending ? (
          <div className="flex items-center gap-3">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ) : isError || !me ? (
          <p className="text-destructive text-sm">{errorMessage(error)}</p>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-xl uppercase">
              {me.username.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-lg">{me.username}</p>
              <p className="truncate text-muted-foreground text-sm">{me.email}</p>
            </div>
            {me.role !== "user" && <Badge variant="secondary">{me.role}</Badge>}
          </div>
        )}

        {me && (
          <section className="space-y-2">
            <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Activity</h2>
            <ul className="divide-y rounded-lg border">
              <li>
                <Link href="/prototype/account/search-history" className="flex items-center gap-3 px-4 py-3">
                  <History className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Search history</span>
                    <span className="block text-muted-foreground text-sm">Recent song searches</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
              <li>
                <Link href="/prototype/account/favorites" className="flex items-center gap-3 px-4 py-3">
                  <Star className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Favorites</span>
                    <span className="block text-muted-foreground text-sm">Songs you have starred</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            </ul>
          </section>
        )}

        {me && (
          <section className="space-y-2">
            <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Settings</h2>
            <ul className="divide-y rounded-lg border">
              <li>
                <button
                  type="button"
                  onClick={() => setRenaming(true)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <AtSign className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Username</span>
                    <span className="block truncate text-muted-foreground text-sm">{me.username}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-2">
          {me && me.role !== "user" && (
            <Button variant="outline" asChild>
              <Link href="/dashboard/default">
                <LayoutDashboard />
                Open admin dashboard
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            {/* Plain anchor: the logout route handler clears the httpOnly cookie and redirects. */}
            <a href="/prototype/auth/logout">
              <LogOut />
              Log out
            </a>
          </Button>
        </div>

        <p className="text-center text-muted-foreground text-xs">
          Tip: add WeWorship to your home screen from your browser's share or install menu.
        </p>
      </div>

      {renaming && me && (
        <UsernameDialog initialUsername={me.username} onSubmit={changeUsername} onClose={() => setRenaming(false)} />
      )}
    </>
  );
}
