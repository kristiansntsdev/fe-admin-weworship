import { redirect } from "next/navigation";

import { api } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

import { VerificationRequestsClient } from "./_components/verification-requests-client";

export const dynamic = "force-dynamic";

export interface VerificationRequest {
  id: number;
  user_id: number;
  username?: string;
  email?: string;
  display_name: string;
  proof_link: string;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VerificationRequestsResponse {
  data: VerificationRequest[];
  total: number;
  page: number;
  limit: number;
}

async function fetchRequests(page: number, status: string): Promise<VerificationRequestsResponse> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    const res = await api.get<{ data: VerificationRequest[]; total: number; page: number; limit: number }>(
      `/api/admin/verification-requests?${params}`,
    );
    const inner = res.data;
    return {
      data: inner?.data ?? [],
      total: inner?.total ?? 0,
      page: inner?.page ?? page,
      limit: inner?.limit ?? 20,
    };
  } catch {
    return { data: [], total: 0, page, limit: 20 };
  }
}

export default async function VerificationRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (sessionUser?.role !== "admin" && sessionUser?.role !== "maintainer") redirect("/unauthorized");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const status = sp.status ?? "";
  const { data, total, limit } = await fetchRequests(page, status);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="font-semibold text-xl">Verification Requests</h1>
        <p className="text-muted-foreground text-sm">{total} total requests</p>
      </div>
      <VerificationRequestsClient requests={data} total={total} page={page} limit={limit} status={status} />
    </div>
  );
}
