import type { ReactNode } from "react";

import Image from "next/image";

import { GoogleButton } from "@/app/(main)/auth/_components/social-auth/google-button";

export function AuthShell({
  title,
  description,
  from,
  children,
  footer,
}: {
  title: string;
  description: string;
  from?: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const googleHref = `/prototype/auth/google${from ? `?from=${encodeURIComponent(from)}` : ""}`;

  return (
    <main className="flex flex-1 flex-col justify-center gap-6 px-6 pt-[env(safe-area-inset-top)] pb-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/prototype-icons/icon-192.png" alt="" width={72} height={72} priority />
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>

      {children}

      <div className="flex items-center gap-3 text-muted-foreground text-xs">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton variant="outline" className="w-full" href={googleHref} />

      <p className="text-center text-muted-foreground text-sm">{footer}</p>
    </main>
  );
}
