// /prototype is a closed beta: only LevelUP members listed in sisko's beta_akses table may get a prototype session.
// sisko answers by email (POST /api/internal/weworship-beta). Anything but a clear yes keeps the door shut.
// Server-only: imported by the /auth/callback route handler and the prototype auth server actions.

export type BetaCheck = "allowed" | "denied" | "unavailable";

/** Login-page `?error=` values and what they show. */
export const BETA_ERRORS = {
  beta: "WeWorship is in closed beta. Only invited LevelUP members can sign in for now.",
  beta_check: "We couldn't check your beta access. Please try again.",
} as const;

export function betaErrorKey(check: Exclude<BetaCheck, "allowed">): keyof typeof BETA_ERRORS {
  return check === "denied" ? "beta" : "beta_check";
}

export async function checkPrototypeBeta(email: string | null | undefined): Promise<BetaCheck> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return "denied";

  const siskoUrl = process.env.SISKO_URL;
  const secret = process.env.SISKO_BETA_SECRET;
  if (!siskoUrl || !secret) {
    console.error("prototype beta: SISKO_URL or SISKO_BETA_SECRET is not set");
    return "unavailable";
  }

  try {
    const res = await fetch(`${siskoUrl}/api/internal/weworship-beta`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ email: normalized }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`prototype beta: sisko answered ${res.status}`);
      return "unavailable";
    }
    const body = (await res.json()) as { allowed?: unknown };
    return body.allowed === true ? "allowed" : "denied";
  } catch (e) {
    console.error("prototype beta: sisko unreachable", e);
    return "unavailable";
  }
}

/** Email claim of a Go JWT (not verified here; the API verifies the signature on every call). */
export function tokenEmail(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf-8")) as { email?: unknown };
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}
