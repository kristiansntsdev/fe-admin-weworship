"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CircleUserRound, Home, ListMusic, Music, Users } from "lucide-react";

import { cn } from "@/lib/utils";

import { prototypeLoginHref, usePrototypeSignedIn } from "../_lib/session";

const TABS = [
  { href: "/prototype/home", guestHref: "/prototype", label: "Home", icon: Home },
  { href: "/prototype/community", label: "Community", icon: Users },
  { href: "/prototype/songs", label: "Song", icon: Music },
  { href: "/prototype/playlists", auth: true, label: "Playlist", icon: ListMusic },
  { href: "/prototype/account", auth: true, label: "Account", icon: CircleUserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const signedIn = usePrototypeSignedIn();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="grid h-16 grid-cols-5">
        {TABS.map((tab) => {
          const { href, label, icon: Icon } = tab;
          const target =
            !signedIn && "guestHref" in tab
              ? tab.guestHref
              : !signedIn && "auth" in tab && tab.auth
                ? prototypeLoginHref(href)
                : href;
          const active =
            href === "/prototype/home"
              ? pathname === "/prototype" || pathname === href || pathname.startsWith(`${href}/`)
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={target}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 font-medium text-[11px] text-muted-foreground transition-colors",
                  active && "text-primary",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
