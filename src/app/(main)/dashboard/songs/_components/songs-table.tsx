import { ChevronLeft, ChevronRight, Edit, Link2, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { Song } from "../page";

interface Props {
  songs: Song[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
}

function hasExternalLink(song: Song): boolean {
  const raw = song.external_links;
  if (!raw) return false;
  // Go sql.NullString serializes as { String: "...", Valid: true }
  const str = typeof raw === "object" && raw !== null && "String" in raw
    ? (raw as { String: string; Valid: boolean }).Valid ? (raw as { String: string }).String : ""
    : typeof raw === "string" ? raw : JSON.stringify(raw);
  if (!str) return false;
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0;
  } catch { return false; }
}

function isChordPro(song: Song): boolean {
  const lyrics = song.lyrics_and_chords ?? "";
  return lyrics.includes("[") && !lyrics.includes("<span");
}

export function SongsTable({ songs = [], total, page, limit, onPageChange, onEdit, onDelete }: Props) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>ChordPro</TableHead>
              <TableHead>Links</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No songs found.
                </TableCell>
              </TableRow>
            ) : (
              songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell className="text-muted-foreground">{Array.isArray(song.artist) ? song.artist.join(", ") : song.artist}</TableCell>
                  <TableCell>{song.base_chord || "—"}</TableCell>
                  <TableCell>
                    {isChordPro(song)
                      ? <Badge variant="outline" className="text-green-600 border-green-600">Ready</Badge>
                      : <Badge variant="outline" className="text-orange-500 border-orange-500">Pending</Badge>}
                  </TableCell>
                  <TableCell>
                    {hasExternalLink(song)
                      ? <Link2 className="size-4 text-muted-foreground" />
                      : <span className="text-muted-foreground/40 text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(song)}>
                          <Edit className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(song)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({total} songs)
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
