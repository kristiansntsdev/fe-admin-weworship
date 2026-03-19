"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SongRequest } from "../page";

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  in_progress: "secondary",
  approved: "default",
  rejected: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  approved: "Approved",
  rejected: "Rejected",
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

interface UpdateDialogProps {
  request: SongRequest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

function UpdateStatusDialog({ request, open, onOpenChange, onSuccess }: UpdateDialogProps) {
  const [status, setStatus] = useState<string>(request?.status ?? "pending");
  const [notes, setNotes] = useState<string>(request?.admin_notes ?? "");
  const [loading, setLoading] = useState(false);

  // sync when request changes
  useState(() => {
    if (request) {
      setStatus(request.status);
      setNotes(request.admin_notes ?? "");
    }
  });

  async function handleSave() {
    if (!request) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/song-requests/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes }),
      });
      onOpenChange(false);
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Request Status</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div>
            <p className="text-sm font-medium">{request?.song_title}</p>
            <a
              href={request?.reference_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 underline truncate block max-w-xs"
            >
              {request?.reference_link}
            </a>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Admin Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for the requester..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Props {
  requests: SongRequest[];
  total: number;
  page: number;
  limit: number;
  status: string;
}

export function SongRequestsClient({ requests, total, page, limit, status }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<SongRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalPages = Math.ceil(total / limit);

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.page && params.page !== "1") sp.set("page", params.page);
    if (params.status) sp.set("status", params.status);
    const qs = sp.toString();
    startTransition(() => router.push(`/dashboard/song-requests${qs ? `?${qs}` : ""}`));
  }

  function openUpdate(req: SongRequest) {
    setSelected(req);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Select
          value={status || "all"}
          onValueChange={(v) => navigate({ status: v === "all" ? "" : v, page: "1" })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Song Title</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Requester ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No song requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.song_title}</TableCell>
                  <TableCell>
                    <a
                      href={req.reference_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-sm truncate block max-w-[200px]"
                      title={req.reference_link}
                    >
                      {req.reference_link}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">#{req.user_id}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[req.status] ?? "outline"}>
                      {STATUS_LABELS[req.status] ?? req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(req.createdAt)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openUpdate(req)}>
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} — {total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => navigate({ status, page: String(page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => navigate({ status, page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <UpdateStatusDialog
        request={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
