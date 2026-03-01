import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TopSongsChart } from "./_components/top-songs-chart";
import { SessionsChart } from "./_components/sessions-chart";

export const dynamic = "force-dynamic";

interface TopSong {
  song_id: number;
  title: string;
  artist: string;
  play_count: number;
}

interface TopSearch {
  query: string;
  count: number;
}

interface PerformanceStat {
  endpoint: string;
  p50_ms: number;
  p95_ms: number;
  total_requests: number;
}

interface Session {
  platform: string;
  count: number;
  date: string;
}

interface UserStats {
  dau: number;
  mau: number;
  total_users: number;
}

async function fetchAnalytics() {
  const [topSongsRes, topSearchesRes, perfRes, sessionsRes, userStatsRes] = await Promise.allSettled([
    api.get<TopSong[]>("/api/admin/analytics/songs?days=30&limit=10"),
    api.get<TopSearch[]>("/api/admin/analytics/searches?days=30&limit=10"),
    api.get<PerformanceStat[]>("/api/admin/analytics/performance?days=7"),
    api.get<Session[]>("/api/admin/analytics/sessions?days=30"),
    api.get<UserStats>("/api/admin/analytics/users?days=1"),
  ]);

  return {
    topSongs: topSongsRes.status === "fulfilled" ? (topSongsRes.value.data ?? []) : [],
    topSearches: topSearchesRes.status === "fulfilled" ? (topSearchesRes.value.data ?? []) : [],
    performance: perfRes.status === "fulfilled" ? (perfRes.value.data ?? []) : [],
    sessions: sessionsRes.status === "fulfilled" ? (sessionsRes.value.data ?? []) : [],
    userStats: userStatsRes.status === "fulfilled" ? (userStatsRes.value.data ?? { dau: 0, mau: 0, total_users: 0 }) : { dau: 0, mau: 0, total_users: 0 },
  };
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  const sessionUser = await getSessionUser();
  if (sessionUser?.role !== "admin") redirect("/unauthorized");

  const { topSongs, topSearches, performance, sessions, userStats } = await fetchAnalytics();

  const totalSessions = sessions.reduce((sum, s) => sum + s.count, 0);
  const topSearch = topSearches[0]?.query ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Last 30 days overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Daily Active Users" value={userStats.dau} subtitle="Today" />
        <StatCard title="Monthly Active Users" value={userStats.mau} subtitle="Last 30 days" />
        <StatCard title="Total Sessions" value={totalSessions} subtitle="Last 30 days" />
        <StatCard title="Top Search" value={topSearch} subtitle="Most searched term" />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopSongsChart songs={topSongs} />
        <SessionsChart sessions={sessions} />
      </div>

      {/* Top Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Top Searches</CardTitle>
        </CardHeader>
        <CardContent>
          {topSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No search data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSearches.map((s, i) => (
                  <TableRow key={s.query}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{s.query}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Performance (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {performance.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No performance data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">p50</TableHead>
                  <TableHead className="text-right">p95</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.map((p) => (
                  <TableRow key={p.endpoint}>
                    <TableCell className="font-mono text-sm">{p.endpoint}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.total_requests.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <Badge variant={p.p50_ms > 500 ? "destructive" : "outline"}>{p.p50_ms}ms</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <Badge variant={p.p95_ms > 1000 ? "destructive" : "outline"}>{p.p95_ms}ms</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
