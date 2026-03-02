import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditLogRow } from "./_components/audit-log-row";

export const dynamic = "force-dynamic";

interface AuditLog {
  id: number;
  user_name: string;
  user_email: string;
  action: "create" | "update" | "delete";
  entity_type: string;
  entity_id: number | null;
  entity_name: string | null;
  changes: string | null; // raw JSON string
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

async function fetchAuditLogs(page: number, action: string, entityType: string): Promise<{ data: AuditLog[]; pagination: Pagination }> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (action) params.set("action", action);
    if (entityType) params.set("entity_type", entityType);
    const res = await api.get<AuditLog[]>(`/api/admin/audit-logs?${params}`);
    return { data: res.data ?? [], pagination: (res as any).pagination ?? { page, limit: 30, total: 0, total_pages: 1 } };
  } catch {
    return { data: [], pagination: { page, limit: 30, total: 0, total_pages: 1 } };
  }
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; entity_type?: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (sessionUser?.role !== "admin") redirect("/unauthorized");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const action = sp.action ?? "";
  const entityType = sp.entity_type ?? "";

  const { data, pagination } = await fetchAuditLogs(page, action, entityType);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl">Audit Log</h1>
          <p className="text-muted-foreground text-sm">{pagination.total} total entries</p>
        </div>
        {/* Simple filter links */}
        <div className="flex gap-2 flex-wrap">
          {["", "create", "update", "delete"].map((a) => (
            <a
              key={a || "all"}
              href={`?action=${a}&entity_type=${entityType}&page=1`}
              className={`rounded-md px-3 py-1 text-sm border transition-colors ${action === a ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {a || "all"}
            </a>
          ))}
          <span className="border-l mx-1" />
          {["", "song", "user"].map((e) => (
            <a
              key={e || "all-entity"}
              href={`?action=${action}&entity_type=${e}&page=1`}
              className={`rounded-md px-3 py-1 text-sm border transition-colors ${entityType === e ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {e || "all entities"}
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">When</TableHead>
              <TableHead>Who</TableHead>
              <TableHead className="w-24">Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">No audit logs found.</TableCell>
              </TableRow>
            )}
            {data.map((log) => (
              <AuditLogRow key={log.id} log={log} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex gap-2 justify-end">
          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}&action=${action}&entity_type=${entityType}`}
              className={`rounded-md px-3 py-1 text-sm border ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
