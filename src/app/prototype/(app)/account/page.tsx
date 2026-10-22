"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, LogOut } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../_components/page-header";
import { errorMessage, qk } from "../../_lib/api";
import { getMe } from "../../_lib/songs";

export default function AccountPage() {
  const { data: me, isPending, isError, error } = useQuery({ queryKey: qk.me, queryFn: getMe });

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
    </>
  );
}
