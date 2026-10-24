import { cookies } from "next/headers";

import { HomeView } from "./_components/home-view";

// Same test as proxy.ts: a decodable, unexpired token counts as signed in (the Go API verifies the signature).
function hasLiveSession(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf-8"));
    return typeof exp !== "number" || exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Public landing page — proxy.ts lets signed-out visitors through to this one prototype route.
// Lives outside (app) so it has no bottom tab bar.
export default async function PrototypeHome() {
  const cookieStore = await cookies();
  return (
    <main className="flex flex-1 flex-col pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <HomeView signedIn={hasLiveSession(cookieStore.get("session_token")?.value)} />
    </main>
  );
}
