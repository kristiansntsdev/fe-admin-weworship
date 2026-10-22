"use client";

import { useState } from "react";

import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ExternalLink, MessageSquarePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { ConfirmDialog } from "../../_components/confirm-dialog";
import { PageHeader } from "../../_components/page-header";
import { errorMessage, qk } from "../../_lib/api";
import { deleteRequest, listRequests } from "../../_lib/requests";
import type { SongRequest, SongRequestStatus } from "../../_lib/types";

const STATUS: Record<SongRequestStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-secondary text-secondary-foreground" },
  in_progress: { label: "In progress", className: "bg-sky-600 text-white" },
  approved: { label: "Approved", className: "bg-emerald-600 text-white" },
  rejected: { label: "Rejected", className: "bg-destructive text-white" },
};

function formatDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : format(d, "d MMM yyyy");
}

export default function RequestsPage() {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<SongRequest | null>(null);

  const { data, isPending, isError, error } = useQuery({ queryKey: qk.requests, queryFn: listRequests });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRequest(id),
    onSuccess: () => {
      setDeleting(null);
      toast.success("Request deleted");
      queryClient.invalidateQueries({ queryKey: qk.requests });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return (
    <>
      <PageHeader
        title="Song requests"
        actions={
          <Button size="sm" asChild>
            <Link href="/prototype/requests/new">
              <Plus />
              New
            </Link>
          </Button>
        }
      />

      {isPending ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        <p className="p-4 text-destructive text-sm">{errorMessage(error)}</p>
      ) : !data?.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquarePlus />
            </EmptyMedia>
            <EmptyTitle>No requests yet</EmptyTitle>
            <EmptyDescription>Can't find a song? Send us the title and lyrics and we'll add it.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/prototype/requests/new">Request a song</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="divide-y">
          {data.map((r) => {
            const status = STATUS[r.status] ?? STATUS.pending;
            return (
              <li key={r.id} className="space-y-1.5 px-4 py-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.song_title}</p>
                    <p className="text-muted-foreground text-xs">
                      {r.lyrics_type === "lyrics_chords" ? "Lyrics + chords" : "Lyrics only"} ·{" "}
                      {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <Badge className={cn("shrink-0", status.className)}>{status.label}</Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleting(r)}
                    aria-label={`Delete request for ${r.song_title}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
                {r.admin_notes && (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm">
                    <span className="font-medium">Admin note: </span>
                    {r.admin_notes}
                  </p>
                )}
                {r.reference_link && (
                  <a
                    href={r.reference_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-1 text-primary text-sm hover:underline"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    <span className="truncate">{r.reference_link}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete request?"
        description={`Your request for “${deleting?.song_title ?? ""}” will be withdrawn.`}
        pending={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </>
  );
}
