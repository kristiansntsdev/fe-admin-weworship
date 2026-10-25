"use client";

import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import type { VerificationRequest } from "../page";

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function UpdateDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
}: {
  request: VerificationRequest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const [status, setStatus] = useState(request?.status ?? "pending");
  const [notes, setNotes] = useState(request?.admin_notes ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!request) return;
    setStatus(request.status);
    setNotes(request.admin_notes ?? "");
  }, [request]);

  async function handleSave() {
    if (!request) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verification-requests/${request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes }),
      });
      const body = await res.json().catch(() => ({ message: res.statusText }));
      if (!res.ok) throw new Error(body.message ?? "Failed to update");
      toast.success("Request updated");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review verification</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div>
            <p className="font-medium text-sm">{request?.display_name}</p>
            <p className="text-muted-foreground text-xs">
              @{request?.username ?? request?.user_id} · {request?.email}
            </p>
            {request?.proof_link && (
              <a
                href={request.proof_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block max-w-xs truncate text-blue-500 text-xs underline"
              >
                {request.proof_link}
              </a>
            )}
            {request?.note && <p className="mt-2 text-muted-foreground text-sm">{request.note}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as VerificationRequest["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Admin notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function VerificationRequestsClient({
  requests,
  total,
  page,
  limit,
  status,
}: {
  requests: VerificationRequest[];
  total: number;
  page: number;
  limit: number;
  status: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<VerificationRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const totalPages = Math.ceil(total / limit) || 1;

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.page && params.page !== "1") sp.set("page", params.page);
    if (params.status) sp.set("status", params.status);
    const qs = sp.toString();
    startTransition(() => router.push(`/dashboard/verification-requests${qs ? `?${qs}` : ""}`));
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display name</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No verification requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-0.5">
                      <span>{req.display_name}</span>
                      {req.note && (
                        <span className="line-clamp-2 max-w-[220px] text-muted-foreground text-xs">{req.note}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span>@{req.username ?? req.user_id}</span>
                      <span className="text-muted-foreground text-xs">{req.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={req.proof_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-[200px] truncate text-blue-500 text-sm underline"
                    >
                      {req.proof_link}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[req.status] ?? "outline"}>{req.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(req.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelected(req);
                        setDialogOpen(true);
                      }}
                    >
                      Review
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
          <p className="text-muted-foreground text-sm">
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

      <UpdateDialog
        request={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
