import type { ReactNode } from "react";

import Link from "next/link";

import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  backHref,
  actions,
  children,
}: {
  title: ReactNode;
  backHref?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex h-14 items-center gap-1 px-2">
        {backHref ? (
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref} aria-label="Back">
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
        ) : (
          <span className="w-2" />
        )}
        <h1 className="min-w-0 flex-1 truncate font-semibold text-lg">{title}</h1>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      {children && <div className="px-4 pb-3">{children}</div>}
    </header>
  );
}
