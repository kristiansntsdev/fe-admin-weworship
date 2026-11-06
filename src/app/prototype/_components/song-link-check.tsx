"use client";

import type { ComponentType, ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, ListMusic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { errorMessage, qk } from "../_lib/api";
import { checkRequestLink } from "../_lib/requests";
import type { SongLinkCheck } from "../_lib/types";

/**
 * Shows whether a reference link holds a chord sheet the backend can read: a preview to copy into the
 * request, a list of songs to pick from (collection pages), or why the page can't be read.
 * `url` must already be debounced and look like an http(s) link; "" renders nothing.
 */
export function SongLinkCheckPanel({
  url,
  lyrics,
  onUse,
  onPick,
}: {
  url: string;
  lyrics: string; // the form's current lyrics, to show when this sheet is already applied
  onUse: (check: SongLinkCheck) => void;
  onPick: (url: string) => void;
}) {
  const { data, error, isPending } = useQuery({
    queryKey: qk.songLink(url),
    queryFn: () => checkRequestLink(url),
    enabled: url !== "",
    staleTime: 10 * 60_000,
    retry: false,
  });

  if (url === "") return null;

  if (isPending) {
    return (
      <output className="flex items-center gap-2 rounded-2xl border p-4 text-muted-foreground text-sm">
        <Spinner />
        Checking link…
      </output>
    );
  }

  if (error) {
    return (
      <Panel icon={CircleAlert} tone="muted" title="Couldn't check this link">
        <p className="text-muted-foreground text-sm">{errorMessage(error)}</p>
      </Panel>
    );
  }

  if (data.status === "supported" && data.content) {
    const applied = lyrics.trim() === data.content.trim();
    const meta = [data.artist, data.key && `Key ${data.key}`].filter(Boolean).join(" · ");
    return (
      <Panel icon={CircleCheck} tone="success" title="Can be added" source={data.source}>
        <p className="text-sm">
          <span className="font-medium">{data.title || "Untitled song"}</span>
          {meta && <span className="text-muted-foreground"> · {meta}</span>}
        </p>
        <pre className="max-h-56 overflow-auto rounded-xl bg-muted/60 p-3 font-mono text-xs leading-5">
          {data.content}
        </pre>
        <Button
          type="button"
          className="w-full"
          variant={applied ? "outline" : "default"}
          disabled={applied}
          onClick={() => onUse(data)}
        >
          {applied ? "Added to your request" : "Use these lyrics & chords"}
        </Button>
      </Panel>
    );
  }

  if (data.status === "collection" && data.songs?.length) {
    return (
      <Panel icon={ListMusic} tone="warning" title={`${data.songs.length} songs on this page`} source={data.source}>
        <p className="text-muted-foreground text-sm">{data.reason}</p>
        <ul className="max-h-64 divide-y overflow-auto rounded-xl border">
          {data.songs.map((s) => (
            <li key={s.url}>
              <button
                type="button"
                onClick={() => onPick(s.url)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50"
              >
                <span className="truncate">{s.title}</span>
                <span className="shrink-0 font-medium text-primary text-xs">Check</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    );
  }

  return (
    <Panel
      icon={CircleAlert}
      tone="muted"
      title={data.status === "unreachable" ? "Couldn't open this link" : "Can't read chords from this page"}
      source={data.source}
    >
      <p className="text-muted-foreground text-sm">
        {data.reason} You can still send the link. Paste the lyrics below if you have them.
      </p>
    </Panel>
  );
}

const TONES = {
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  muted: "text-muted-foreground",
} as const;

function Panel({
  icon: Icon,
  tone,
  title,
  source,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  tone: keyof typeof TONES;
  title: string;
  source?: string;
  children: ReactNode;
}) {
  return (
    // Not <output>: the panel holds <pre>/<ul>, which <output> (phrasing content only) can't contain.
    <section aria-live="polite" aria-label={title} className="space-y-3 rounded-2xl border p-4">
      <div className="flex items-start gap-2">
        <Icon className={cn("mt-0.5 size-4 shrink-0", TONES[tone])} />
        <div className="min-w-0">
          <p className={cn("font-medium text-sm", TONES[tone])}>{title}</p>
          {source && <p className="truncate text-muted-foreground text-xs">{source}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
