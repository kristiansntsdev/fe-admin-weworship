"use client";

import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import type { SongReport } from "../page";

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  lyrics: "Lyrics",
  chord: "Chord",
  other: "Other",
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

interface UpdateDialogProps {
  report: SongReport | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

function UpdateStatusDialog({ report, open, onOpenChange, onSuccess }: UpdateDialogProps) {
  const [status, setStatus] = useState<string>(report?.status ?? "pending");
  const [notes, setNotes] = useState<string>(report?.admin_notes ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (report) {
      setStatus(report.status);
      setNotes(report.admin_notes ?? "");
    }
  }, [report]);

  async function handleSave() {
    if (!report) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/song-reports/${report.id}`, {
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
          <DialogTitle>Review Song Report</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div>
            <p className="font-medium text-sm">{report?.song_title}</p>
            <p className="text-muted-foreground text-xs">
              {report ? (REPORT_TYPE_LABELS[report.report_type] ?? report.report_type) : ""}
            </p>
            {report?.evidence_url ? (
              <a
                href={report.evidence_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block max-w-xs truncate text-blue-500 text-xs underline"
              >
                {report.evidence_url}
              </a>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <p className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm leading-6">
              {report?.description}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
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
            <Label>Admin Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for the reporter..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Props {
  reports: SongReport[];
  total: number;
  page: number;
  limit: number;
  status: string;
}

export function SongReportsClient({ reports, total, page, limit, status }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<SongReport | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalPages = Math.ceil(total / limit);

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.page && params.page !== "1") sp.set("page", params.page);
    if (params.status) sp.set("status", params.status);
    const qs = sp.toString();
    startTransition(() => router.push(`/dashboard/song-reports${qs ? `?${qs}` : ""}`));
  }

  function openUpdate(report: SongReport) {
    setSelected(report);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Select value={status || "all"} onValueChange={(v) => navigate({ status: v === "all" ? "" : v, page: "1" })}>
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
              <TableHead>Song</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Requester ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No song reports found.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{report.song_title}</span>
                      <span className="text-muted-foreground text-xs">Song #{report.song_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{REPORT_TYPE_LABELS[report.report_type] ?? report.report_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-2 block max-w-[260px] text-muted-foreground text-sm">
                      {report.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={report.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-[200px] truncate text-blue-500 text-sm underline"
                      title={report.evidence_url}
                    >
                      {report.evidence_url}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">#{report.user_id}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[report.status] ?? "outline"}>
                      {STATUS_LABELS[report.status] ?? report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openUpdate(report)}>
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
            Page {page} of {totalPages} - {total} total
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
        report={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
