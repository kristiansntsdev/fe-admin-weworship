import { Music2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TopSong {
  song_id: number;
  title: string;
  play_count: number;
}

export function DataTable({ data }: { data: TopSong[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music2 className="size-4" />
          Top Songs (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
            No song play data yet. Data is recorded when users play songs on mobile.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Song</TableHead>
                <TableHead className="text-right">Plays</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((song, index) => (
                <TableRow key={song.song_id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell className="text-right tabular-nums">{song.play_count.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

