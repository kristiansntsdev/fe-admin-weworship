import { ArrowDown, ArrowUp, ArrowUpDown, Edit, Link2, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { Song } from "../page";

interface Props {
  songs: Song[];
  total: number;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  onPageChange: (page: number) => void;
  onSort: (col: string) => void;
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

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  const addPage = (p: number) => { if (!pages.includes(p)) pages.push(p); };
  addPage(1);
  if (current > 3) pages.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) addPage(p);
  if (current < total - 2) pages.push("...");
  addPage(total);
  return pages;
}

export function SongsTable({ songs = [], total, page, limit, sortBy, sortOrder, onPageChange, onSort, onEdit, onDelete }: Props) {
  const totalPages = Math.ceil(total / limit);

  function SortIcon({ col }: { col: string }) {
    if (sortBy !== col) return <ArrowUpDown className="size-3 ml-1 opacity-40" />;
    return sortOrder === "ASC" ? <ArrowUp className="size-3 ml-1" /> : <ArrowDown className="size-3 ml-1" />;
  }

  function SortHead({ col, label }: { col: string; label: string }) {
    return (
      <button
        className="flex items-center gap-0.5 hover:text-foreground transition-colors font-medium"
        onClick={() => onSort(col)}
      >
        {label}<SortIcon col={col} />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortHead col="title" label="Title" /></TableHead>
              <TableHead><SortHead col="artist" label="Artist" /></TableHead>
              <TableHead><SortHead col="base_chord" label="Key" /></TableHead>
              <TableHead><SortHead col="bpm" label="BPM" /></TableHead>
              <TableHead>ChordPro</TableHead>
              <TableHead>Links</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No songs found.
                </TableCell>
              </TableRow>
            ) : (
              songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell className="text-muted-foreground">{Array.isArray(song.artist) ? song.artist.join(", ") : song.artist}</TableCell>
                  <TableCell>{song.base_chord || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{song.bpm ?? "—"}</TableCell>
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
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page > 1) onPageChange(page - 1); }}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {buildPageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => { e.preventDefault(); onPageChange(p as number); }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page < totalPages) onPageChange(page + 1); }}
                  aria-disabled={page >= totalPages}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
