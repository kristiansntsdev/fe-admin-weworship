"use client";

import { useState } from "react";

import Link from "next/link";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AtSign, BadgeCheck, ChevronRight, Clock, LayoutDashboard, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../../_components/page-header";
import { UsernameDialog } from "../../../_components/username-dialog";
import { VerificationRequestSheet } from "../../../_components/verification-request-sheet";
import { errorMessage, qk } from "../../../_lib/api";
import { prototypeChangeUsername } from "../../../_lib/auth-actions";
import { getMe } from "../../../_lib/songs";
import type { Me } from "../../../_lib/types";
import { getMyVerificationRequest } from "../../../_lib/verification";

export default function AccountSettingsPage() {
  const queryClient = useQueryClient();
  const [renaming, setRenaming] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const { data: me, isPending, isError, error } = useQuery({ queryKey: qk.me, queryFn: getMe });
  const verificationQuery = useQuery({
    queryKey: qk.verificationMe,
    queryFn: getMyVerificationRequest,
    enabled: !!me && !me.verified,
    retry: false,
  });

  async function changeUsername(username: string) {
    const result = await prototypeChangeUsername(username);
    if ("error" in result) throw new Error(result.error);
    queryClient.setQueryData<Me>(qk.me, (prev) => (prev ? { ...prev, username: result.username } : prev));
    toast.success("Username updated");
  }

  const latestRequest = verificationQuery.data;
  const pending = latestRequest?.status === "pending";
  const rejected = latestRequest?.status === "rejected";

  return (
    <>
      <PageHeader title="Settings" backHref="/prototype/account" />

      <div className="space-y-6 p-4">
        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : isError || !me ? (
          <p className="text-destructive text-sm">{errorMessage(error)}</p>
        ) : (
          <section className="space-y-2">
            <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Account</h2>
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
              {!me.verified && (
                <li>
                  {pending ? (
                    <div className="flex items-center gap-3 px-4 py-3 text-muted-foreground">
                      <Clock className="size-5 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-foreground">Verification pending</span>
                        <span className="block text-sm">We’re reviewing your official account request</span>
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRequestOpen(true)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <BadgeCheck className="size-5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">Request official account</span>
                        <span className="block text-muted-foreground text-sm">
                          {rejected
                            ? "Previous request was declined — you can apply again"
                            : "Get a verified badge on your posts"}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  )}
                </li>
              )}
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
            <a href="/prototype/auth/logout">
              <LogOut />
              Log out
            </a>
          </Button>
        </div>

        <p className="text-center text-muted-foreground text-xs">
          Tip: add WeWorship to your home screen from your browser&apos;s share or install menu.
        </p>
      </div>

      {renaming && me && (
        <UsernameDialog initialUsername={me.username} onSubmit={changeUsername} onClose={() => setRenaming(false)} />
      )}

      <VerificationRequestSheet
        open={requestOpen}
        onOpenChange={setRequestOpen}
        rejectNote={rejected ? latestRequest?.admin_notes : null}
      />
    </>
  );
}
