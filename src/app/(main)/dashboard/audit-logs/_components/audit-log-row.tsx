"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuditLog {
  id: number;
  user_name: string;
  user_email: string;
  action: "create" | "update" | "delete";
  entity_type: string;
  entity_id: number | null;
  entity_name: string | null;
  changes: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
};

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function ChangesDetail({ raw }: { raw: string | null }) {
  if (!raw) return <p className="text-muted-foreground text-sm">No changes recorded.</p>;
  try {
    const obj = JSON.parse(raw);
    const entries = Object.entries(obj);
    if (entries.length === 0) return <p className="text-muted-foreground text-sm">Empty changes.</p>;
    return (
      <div className="flex flex-col gap-3">
        {entries.map(([key, value]) => {
          const isFromTo =
            typeof value === "object" && value !== null && "from" in value && "to" in value;
          return (
            <div key={key} className="rounded-md border p-3 text-sm">
              <div className="font-medium text-xs text-muted-foreground uppercase mb-1">{key}</div>
              {isFromTo ? (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <span className="text-xs font-medium text-red-500 w-8 shrink-0">From</span>
                    <span className="break-all">{String((value as any).from) || "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-medium text-green-500 w-8 shrink-0">To</span>
                    <span className="break-all">{String((value as any).to) || "—"}</span>
                  </div>
                </div>
              ) : (
                <span className="break-all">{String(value)}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  } catch {
    return <pre className="text-xs break-all whitespace-pre-wrap">{raw}</pre>;
  }
}

function shortChanges(raw: string | null): string {
  if (!raw) return "—";
  try {
    const obj = JSON.parse(raw);
    const keys = Object.keys(obj);
    if (keys.length === 0) return "—";
    return keys.join(", ");
  } catch {
    return raw.slice(0, 60);
  }
}

export function AuditLogRow({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);
  const hasChanges = !!log.changes;

  return (
    <>
      <TableRow
        className={hasChanges ? "cursor-pointer hover:bg-muted/60" : ""}
        onClick={hasChanges ? () => setOpen(true) : undefined}
      >
        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(log.createdAt)}
        </TableCell>
        <TableCell>
          <div className="text-sm font-medium">{log.user_name}</div>
          <div className="text-xs text-muted-foreground">{log.user_email}</div>
        </TableCell>
        <TableCell>
          <Badge variant={ACTION_COLORS[log.action] ?? "outline"}>{log.action}</Badge>
        </TableCell>
        <TableCell>
          <div className="text-sm">{log.entity_name ?? "—"}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {log.entity_type}
            {log.entity_id ? ` #${log.entity_id}` : ""}
          </div>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground max-w-xs">
          <span className="truncate block max-w-xs">{shortChanges(log.changes)}</span>
          {hasChanges && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              View details
            </Button>
          )}
        </TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant={ACTION_COLORS[log.action] ?? "outline"}>{log.action}</Badge>
              <span>{log.entity_name ?? log.entity_type}</span>
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {log.user_name} · {formatDate(log.createdAt)}
            </p>
          </DialogHeader>
          <ChangesDetail raw={log.changes} />
        </DialogContent>
      </Dialog>
    </>
  );
}
