// Admin dashboard and /prototype keep independent JWTs so both can be signed in at once.
export const ADMIN_SESSION_COOKIE = "admin_session";
export const PROTOTYPE_SESSION_COOKIE = "prototype_session";

/** Legacy shared cookie — delete on login/logout so old sessions don't leak across apps. */
export const LEGACY_SESSION_COOKIE = "session_token";

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  };
}

/** Decodable, unexpired JWT counts as signed in (API still verifies the signature). */
export function hasLiveSession(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf-8")) as {
      exp?: number;
    };
    return typeof payload.exp !== "number" || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
