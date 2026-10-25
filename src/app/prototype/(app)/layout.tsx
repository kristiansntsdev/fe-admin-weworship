import type { ReactNode } from "react";

import { cookies } from "next/headers";

import { PROTOTYPE_SESSION_COOKIE, hasLiveSession } from "@/lib/session-cookies";

import { BottomNav } from "../_components/bottom-nav";
import { PrototypeSessionProvider } from "../_lib/session";

export default async function PrototypeAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const signedIn = hasLiveSession(cookieStore.get(PROTOTYPE_SESSION_COOKIE)?.value);

  return (
    <PrototypeSessionProvider signedIn={signedIn}>
      <main className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav />
    </PrototypeSessionProvider>
  );
}
