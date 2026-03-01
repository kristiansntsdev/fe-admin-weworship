import { api } from "@/lib/api";
import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import { DataTable } from "./_components/data-table";
import { SectionCards } from "./_components/section-cards";

export const dynamic = "force-dynamic";

async function fetchDashboardData() {
  try {
    const [homeRes, userStatsRes, topSongsRes, sessionsRes] = await Promise.allSettled([
      api.get<{ song_count: number; artist_count: number }>("/api/home"),
      api.get<{ dau: number; mau: number; total_users: number }>("/api/admin/analytics/users?days=1"),
      api.get<{ song_id: number; title: string; play_count: number }[]>("/api/admin/analytics/songs?days=30&limit=10"),
      api.get<{ platform: string; count: number; date: string }[]>("/api/admin/analytics/sessions?days=30"),
    ]);

    return {
      home: homeRes.status === "fulfilled" ? homeRes.value.data : { song_count: 0, artist_count: 0 },
      userStats: userStatsRes.status === "fulfilled" ? userStatsRes.value.data : { dau: 0, mau: 0, total_users: 0 },
      topSongs: topSongsRes.status === "fulfilled" ? (topSongsRes.value.data ?? []) : [],
      sessions: sessionsRes.status === "fulfilled" ? (sessionsRes.value.data ?? []) : [],
    };
  } catch {
    return {
      home: { song_count: 0, artist_count: 0 },
      userStats: { dau: 0, mau: 0, total_users: 0 },
      topSongs: [],
      sessions: [],
    };
  }
}

export default async function Page() {
  const { home, userStats, topSongs, sessions } = await fetchDashboardData();

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <SectionCards
        songCount={home.song_count}
        artistCount={home.artist_count}
        dau={userStats.dau}
        totalUsers={userStats.total_users}
      />
      <ChartAreaInteractive sessions={sessions} />
      <DataTable data={topSongs} />
    </div>
  );
}
