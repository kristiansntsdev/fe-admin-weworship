import { redirect } from "next/navigation";

import { api } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

import { SongReportsClient } from "./_components/song-reports-client";

export const dynamic = "force-dynamic";

export interface SongReport {
  id: number;
  user_id: number;
  song_id: number;
  song_title: string;
  report_type: "lyrics" | "chord" | "other";
  description: string;
  evidence_url: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SongReportsResponse {
  data: SongReport[];
  total: number;
  page: number;
  limit: number;
}

async function fetchSongReports(page: number, status: string): Promise<SongReportsResponse> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    const res = await api.get<SongReportsResponse>(`/api/admin/song-reports?${params}`);
    const innerData = res.data;

    return {
      data: innerData?.data ?? [],
      total: innerData?.total ?? 0,
      page: innerData?.page ?? page,
      limit: innerData?.limit ?? 20,
    };
  } catch (err) {
    console.error("Failed to fetch song reports:", err);
    return { data: [], total: 0, page, limit: 20 };
  }
}

export default async function SongReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (sessionUser?.role !== "admin" && sessionUser?.role !== "maintainer") redirect("/unauthorized");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const status = sp.status ?? "";

  const { data, total, limit } = await fetchSongReports(page, status);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl">Song Reports</h1>
          <p className="text-muted-foreground text-sm">{total} total reports</p>
        </div>
      </div>
      <SongReportsClient reports={data} total={total} page={page} limit={limit} status={status} />
    </div>
  );
}
