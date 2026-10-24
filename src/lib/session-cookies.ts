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
