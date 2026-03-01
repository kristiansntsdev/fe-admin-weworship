"use client";
import * as React from "react";

import { useRouter } from "next/navigation";
import { Music2, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { SessionUser } from "@/lib/auth";

interface SongResult {
  id: number;
  title: string;
  artist: string;
}

interface UserResult {
  id: number;
  name: string;
  email: string;
}

interface Props {
  role: SessionUser["role"];
}

export function SearchDialog({ role }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [songs, setSongs] = React.useState<SongResult[]>([]);
  const [users, setUsers] = React.useState<UserResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) { setSongs([]); setUsers([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const requests: Promise<void>[] = [
          fetch(`/api/songs?search=${encodeURIComponent(query)}&limit=8&page=1`)
            .then((r) => r.json())
            .then((j) => setSongs(j.data ?? [])),
        ];
        if (role === "admin") {
          requests.push(
            fetch(`/api/admin/users?search=${encodeURIComponent(query)}&limit=5`)
              .then((r) => r.json())
              .then((j) => setUsers(j.data ?? [])),
          );
        }
        await Promise.all(requests);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, role]);

  function select(path: string) {
    setOpen(false);
    router.push(path);
  }

  const hasResults = songs.length > 0 || users.length > 0;

  return (
    <>
      <Button
        variant="link"
        className="!px-0 font-normal text-muted-foreground hover:no-underline"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Search
        <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={role === "admin" ? "Search songs or users…" : "Search songs…"}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && <CommandEmpty>Searching…</CommandEmpty>}
          {!loading && query.trim() && !hasResults && <CommandEmpty>No results found.</CommandEmpty>}

          {songs.length > 0 && (
            <CommandGroup heading="Songs">
              {songs.map((song) => (
                <CommandItem
                  key={`song-${song.id}`}
                  value={`song-${song.id}-${song.title}`}
                  onSelect={() => select(`/dashboard/songs/${song.id}/edit`)}
                  className="!py-1.5"
                >
                  <Music2 className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{song.title}</span>
                    <span className="text-muted-foreground text-xs">{song.artist}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {users.length > 0 && (
            <>
              {songs.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Users">
                {users.map((user) => (
                  <CommandItem
                    key={`user-${user.id}`}
                    value={`user-${user.id}-${user.name}`}
                    onSelect={() => select(`/dashboard/users`)}
                    className="!py-1.5"
                  >
                    <User className="size-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-muted-foreground text-xs">{user.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
