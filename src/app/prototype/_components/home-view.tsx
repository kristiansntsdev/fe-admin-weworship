"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { MotionConfig, motion } from "framer-motion";
import { ArrowRight, Guitar, ListMusic, type LucideIcon, MicVocal, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { qk } from "../_lib/api";
import { getHomeStats, MOST_ADDED_SONGS, POPULAR_SONGS } from "../_lib/home";
import { getMe } from "../_lib/songs";
import { MostAddedSongs, SampleBadge, TrendingSongs } from "./song-rankings";
import { TransposeDemo } from "./transpose-demo";

// Faint chord symbols behind the hero headline.
const HERO_CHORDS = [
  { chord: "G", className: "top-14 right-5 rotate-6 text-6xl" },
  { chord: "D/F#", className: "bottom-14 left-1/2 -rotate-3 text-xl" },
  { chord: "Em7", className: "bottom-14 right-5 rotate-3 text-xl" },
  { chord: "Asus4", className: "bottom-14 left-5 rotate-2 text-xl" },
];

const AUDIENCES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Guitar,
    title: "Musicians",
    body: "Clean chord charts above every lyric. Move the whole song to your key — or your singer's — in one tap.",
  },
  {
    icon: ListMusic,
    title: "Worship leaders",
    body: "Build Sunday's setlist, set the key for each song, and swipe through it on stage in play mode.",
  },
  {
    icon: MicVocal,
    title: "Singers",
    body: "Turn chords off for clean lyrics. Only remember one line? Search the lyrics and find the song.",
  },
  {
    icon: Users,
    title: "Your whole team",
    body: "Share a setlist link — your team joins and sees every song in the key you picked.",
  },
];

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function SectionHeading({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 pb-3">
      <div>
        <p className="font-semibold text-primary text-xs uppercase tracking-wider">{eyebrow}</p>
        <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

function Stat({ value, label, failed }: { value?: number; label: string; failed?: boolean }) {
  return (
    <div className="rounded-xl border p-3 text-center">
      {value === undefined && !failed ? (
        <Skeleton className="mx-auto h-8 w-14" />
      ) : (
        <p className="font-semibold text-2xl tabular-nums">{value?.toLocaleString() ?? "—"}</p>
      )}
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

function PrimaryActions({ signedIn, className }: { signedIn: boolean; className?: string }) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Button size="lg" className="flex-1 bg-white text-primary hover:bg-white/90" asChild>
        <Link href={signedIn ? "/prototype/songs" : "/prototype/register"}>
          {signedIn ? "Browse songs" : "Get started"}
          <ArrowRight />
        </Link>
      </Button>
      <Button
        size="lg"
        variant="ghost"
        className="flex-1 border border-white/30 text-white hover:bg-white/10 hover:text-white"
        asChild
      >
        <Link href={signedIn ? "/prototype/playlists" : "/prototype/login"}>
          {signedIn ? "My playlists" : "Sign in"}
        </Link>
      </Button>
    </div>
  );
}

// signedIn gates /auth/me: for a signed-out visitor it answers 401, which protoFetch turns into a redirect to login.
export function HomeView({ signedIn }: { signedIn: boolean }) {
  const { data: me } = useQuery({ queryKey: qk.me, queryFn: getMe, enabled: signedIn });
  const { data: stats, isError } = useQuery({ queryKey: qk.home, queryFn: getHomeStats });

  return (
    <MotionConfig reducedMotion="user">
      <header className="relative overflow-hidden bg-primary px-5 pt-[calc(env(safe-area-inset-top)+1rem)] pb-20 text-white">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black/50" />
        {HERO_CHORDS.map(({ chord, className }) => (
          <span
            key={chord}
            aria-hidden
            className={cn("pointer-events-none absolute select-none font-bold font-mono text-white/10", className)}
          >
            {chord}
          </span>
        ))}

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/prototype-icons/icon-192.png"
              alt=""
              width={32}
              height={32}
              className="rounded-lg ring-1 ring-white/30"
            />
            <span className="font-semibold">WeWorship</span>
          </div>
          <Link
            href={signedIn ? "/prototype/account" : "/prototype/login"}
            className="font-medium text-sm text-white/80 hover:text-white"
          >
            {signedIn ? (me?.username ?? "Account") : "Sign in"}
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative pt-10"
        >
          <p className="font-medium text-sm text-white/75">
            {signedIn ? `Welcome back${me ? `, ${me.username}` : ""}` : "For worship musicians, leaders & singers"}
          </p>
          <h1 className="pt-2 font-bold text-[34px] leading-[1.1] tracking-tight">
            Every song, in any key, ready for Sunday.
          </h1>
          <p className="pt-3 text-white/80 leading-relaxed">
            Chord charts and lyrics for worship songs in Indonesian and English. Transpose in a tap, build your setlist,
            and share it with your team.
          </p>
          <PrimaryActions signedIn={signedIn} className="pt-6" />
        </motion.div>
      </header>

      <div className="-mt-12 relative px-4">
        <TransposeDemo />
      </div>

      <Reveal className="px-4 pt-10">
        <SectionHeading eyebrow="At a glance" title="A growing worship library" />
        {/* A failed fetch shows "—" rather than an error message — this is the marketing surface. */}
        <div className="grid grid-cols-3 gap-2">
          <Stat value={stats?.song_count} label="Songs" failed={isError} />
          <Stat value={stats?.artist_count} label="Artists" failed={isError} />
          <Stat value={12} label="Keys to pick" />
        </div>
      </Reveal>

      <Reveal className="px-4 pt-10">
        <SectionHeading eyebrow="Trending" title="Most popular this week" aside={<SampleBadge />} />
        <TrendingSongs songs={POPULAR_SONGS} />
      </Reveal>

      <Reveal className="px-4 pt-8">
        <SectionHeading eyebrow="Setlist favourites" title="Most added to playlists" aside={<SampleBadge />} />
        <MostAddedSongs songs={MOST_ADDED_SONGS} />
      </Reveal>

      <Reveal className="px-4 pt-10">
        <SectionHeading eyebrow="Made for the whole band" title="Built for everyone who leads and sings" />
        <ul className="divide-y rounded-2xl border">
          {AUDIENCES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-muted-foreground text-sm leading-relaxed">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="px-4 pt-10">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-white">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent to-black/40" />
          <figure className="relative">
            <blockquote className="font-serif text-xl italic leading-snug">
              “O sing unto the LORD a new song: sing unto the LORD, all the earth.”
            </blockquote>
            <figcaption className="pt-2 text-sm text-white/70">Psalm 96:1 (KJV)</figcaption>
          </figure>
          <p className="relative pt-5 text-white/85">
            {signedIn ? "Your next setlist is a few taps away." : "Get your team ready for Sunday — in every key."}
          </p>
          <PrimaryActions signedIn={signedIn} className="relative pt-4" />
        </div>
        <p className="pt-4 text-center text-muted-foreground text-sm">
          Can’t find a song?{" "}
          <Link href="/prototype/requests/new" className="font-medium text-primary hover:underline">
            Request it
          </Link>
        </p>
      </Reveal>

      <footer className="px-4 pt-10 text-center text-muted-foreground text-xs">
        © {new Date().getFullYear()} WeWorship · Made for the Church
      </footer>
    </MotionConfig>
  );
}
