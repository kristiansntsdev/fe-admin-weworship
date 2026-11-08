"use client";

import { useState } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { Search, UserSearch } from "lucide-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "../../_components/page-header";
import { UserAvatar } from "../../_components/user-avatar";
import { VerifiedBadge } from "../../_components/verified-badge";
import { errorMessage, qk } from "../../_lib/api";
import { profileHref, searchProfiles } from "../../_lib/profiles";
import { useDebouncedValue } from "../../_lib/use-debounced-value";

const MIN_QUERY = 2;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Find other users by username or display name, then open their public profile.
export default function PeoplePage() {
  const [query, setQuery] = useState("");
  const q = useDebouncedValue(query, 300).trim();
  const searching = q.replace(/^@/, "").length >= MIN_QUERY;

  const { data, isPending, isError, error } = useQuery({
    queryKey: qk.profiles(q),
    queryFn: () => searchProfiles(q),
    enabled: searching,
    staleTime: 60_000,
  });

  return (
    <>
      <PageHeader title="Find people" backHref="/prototype/community">
        <div className="relative">
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name"
            aria-label="Search people"
            autoCapitalize="none"
            autoCorrect="off"
            className="pl-9"
          />
        </div>
      </PageHeader>

      {!searching ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserSearch />
            </EmptyMedia>
            <EmptyTitle>Find worship leaders and friends</EmptyTitle>
            <EmptyDescription>
              Type at least {MIN_QUERY} letters of a username or name to see their public playlists.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isPending ? (
        <div className="space-y-4 p-4">
          {Array.from({ length: 4 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="p-4 text-destructive text-sm">{errorMessage(error)}</p>
      ) : (data ?? []).length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No one found</EmptyTitle>
            <EmptyDescription>No username or name matches “{q}”.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="divide-y">
          {(data ?? []).map((p) => (
            <li key={p.username}>
              <Link href={profileHref(p.username)} className="flex items-center gap-3 px-4 py-3">
                <UserAvatar username={p.username} avatarUrl={p.avatar_url} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{p.display_name}</span>
                    {p.verified && <VerifiedBadge size="sm" />}
                  </span>
                  <span className="block truncate text-muted-foreground text-sm">
                    @{p.username} · {plural(p.public_playlists, "public playlist")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
