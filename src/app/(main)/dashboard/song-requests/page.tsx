import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { SongRequestsClient } from "./_components/song-requests-client";

export const dynamic = "force-dynamic";

export interface SongRequest {
  id: number;
  user_id: number;
  song_title: string;
  reference_link: string;
  status: "pending" | "in_progress" | "approved" | "rejected";
  admin_notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SongRequestsResponse {
  data: SongRequest[];
  total: number;
  page: number;
  limit: number;
}

async function fetchSongRequests(page: number, status: string): Promise<SongRequestsResponse> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);
    const res = await api.get<SongRequest[]>(`/api/admin/song-requests?${params}`);
    const body = res as unknown as SongRequestsResponse;
    return {
      data: body.data ?? [],
      total: body.total ?? 0,
      page: body.page ?? page,
      limit: body.limit ?? 20,
    };
  } catch {
    return { data: [], total: 0, page, limit: 20 };
  }
}

export default async function SongRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (sessionUser?.role !== "admin") redirect("/unauthorized");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const status = sp.status ?? "";

  const { data, total, limit } = await fetchSongRequests(page, status);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl">Song Requests</h1>
          <p className="text-muted-foreground text-sm">{total} total requests</p>
        </div>
      </div>
      <SongRequestsClient
        requests={data}
        total={total}
        page={page}
        limit={limit}
        status={status}
      />
    </div>
  );
}
