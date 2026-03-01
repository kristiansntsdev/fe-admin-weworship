import { Music, Music2, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardsProps {
  songCount: number;
  artistCount: number;
  dau: number;
  totalUsers: number;
}

export function SectionCards({ songCount, artistCount, dau, totalUsers }: SectionCardsProps) {
  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Songs</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{songCount.toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Music2 className="size-3" />
              Songs
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total songs in library
          </div>
          <div className="text-muted-foreground">Across all artists and tags</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Artists</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{artistCount.toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Music className="size-3" />
              Artists
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Unique artists in library
          </div>
          <div className="text-muted-foreground">Derived from song metadata</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Daily Active Users</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{dau.toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp className="size-3" />
              DAU
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active sessions today
          </div>
          <div className="text-muted-foreground">From mobile app sessions</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{totalUsers.toLocaleString()}</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Users className="size-3" />
              Users
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registered users
          </div>
          <div className="text-muted-foreground">All time signups</div>
        </CardFooter>
      </Card>
    </div>
  );
}
