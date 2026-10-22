"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CircleUserRound, ListMusic, MessageSquarePlus, Music } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/prototype/songs", label: "Songs", icon: Music },
  { href: "/prototype/playlists", label: "Playlists", icon: ListMusic },
  { href: "/prototype/requests", label: "Requests", icon: MessageSquarePlus },
  { href: "/prototype/account", label: "Account", icon: CircleUserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="grid h-16 grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
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
