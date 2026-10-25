import { cookies } from "next/headers";

import { PROTOTYPE_SESSION_COOKIE, hasLiveSession } from "@/lib/session-cookies";

import { HomeView } from "./_components/home-view";

// Public landing page — proxy.ts lets signed-out visitors through to this one prototype route.
// Lives outside (app) so it has no bottom tab bar.
export default async function PrototypeHome() {
  const cookieStore = await cookies();
  return (
    <main className="flex flex-1 flex-col pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <HomeView signedIn={hasLiveSession(cookieStore.get(PROTOTYPE_SESSION_COOKIE)?.value)} />
    </main>
  );
}
