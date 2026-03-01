"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Session {
  platform: string;
  count: number;
  date: string;
}

interface ChartRow {
  date: string;
  ios: number;
  android: number;
}

function groupSessions(sessions: Session[]): ChartRow[] {
  const map: Record<string, ChartRow> = {};
  for (const s of sessions) {
    const day = s.date?.slice(0, 10) ?? "";
    if (!map[day]) map[day] = { date: day, ios: 0, android: 0 };
    if (s.platform === "ios") map[day].ios += s.count;
    else if (s.platform === "android") map[day].android += s.count;
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

const chartConfig = {
  ios: { label: "iOS", color: "var(--chart-1)" },
  android: { label: "Android", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function SessionsChart({ sessions }: { sessions: Session[] }) {
  const data = groupSessions(sessions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Sessions by Platform</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No session data yet.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillIos2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-ios)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-ios)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillAndroid2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-android)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-android)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area dataKey="android" type="natural" fill="url(#fillAndroid2)" stroke="var(--color-android)" stackId="a" />
              <Area dataKey="ios" type="natural" fill="url(#fillIos2)" stroke="var(--color-ios)" stackId="a" />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
