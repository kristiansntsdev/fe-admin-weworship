"use client";

import * as React from "react";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

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

export function ChartAreaInteractive({ sessions }: { sessions: Session[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  const allData = groupSessions(sessions);

  const filteredData = allData.filter((item) => {
    const date = new Date(item.date);
    const now = new Date();
    const days = timeRange === "7d" ? 7 : 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return date >= startDate;
  });

  // Fallback: if no real data, show empty state
  const displayData = filteredData.length > 0 ? filteredData : [];

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>App Sessions</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">iOS vs Android sessions</span>
          <span className="@[540px]/card:hidden">Sessions by platform</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden *:data-[slot=toggle-group-item]:px-4!"
          >
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex @[767px]/card:hidden w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {displayData.length === 0 ? (
          <div className="flex h-62 items-center justify-center text-muted-foreground text-sm">
            No session data yet. Sessions are recorded when mobile app opens.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-62 w-full">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="fillIos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-ios)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-ios)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillAndroid" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area dataKey="android" type="natural" fill="url(#fillAndroid)" stroke="var(--color-android)" stackId="a" />
              <Area dataKey="ios" type="natural" fill="url(#fillIos)" stroke="var(--color-ios)" stackId="a" />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
