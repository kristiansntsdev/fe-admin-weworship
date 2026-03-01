"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface TopSong {
  song_id: number;
  title: string;
  artist: string;
  play_count: number;
}

const chartConfig = {
  play_count: { label: "Plays", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function TopSongsChart({ songs }: { songs: TopSong[] }) {
  const data = songs.map((s) => ({
    name: s.title.length > 20 ? s.title.slice(0, 18) + "…" : s.title,
    play_count: s.play_count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Songs (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No play data yet.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={4} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={120}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="play_count" fill="var(--color-play_count)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
