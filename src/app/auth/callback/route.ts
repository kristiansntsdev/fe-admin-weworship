import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
  PROTOTYPE_SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session-cookies";

// Set by /prototype/auth/google so Google sign-in returns to the prototype instead of the dashboard
const POST_AUTH_REDIRECT_COOKIE = "post_auth_redirect";
const MOBILE_SCHEME = process.env.MOBILE_APP_SCHEME ?? "weworship";

// Go redirects here after successful Google OAuth:
//   GET /auth/callback?token=<JWT>
//   GET /auth/callback?token=<JWT>&client=mobile  (from mobile deep link fallback)
// We store the JWT in an httpOnly cookie and redirect to the dashboard or prototype.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token = searchParams.get("token");
  const client = searchParams.get("client");

  if (!token) {
    return NextResponse.redirect(`${origin}/auth/v2/login?error=google_failed`);
  }

  // If this request came from a mobile client, redirect to the app deep link
  if (client === "mobile") {
    return NextResponse.redirect(`${MOBILE_SCHEME}://auth/callback?token=${token}`);
  }

  const cookieStore = await cookies();
  const postAuthRedirect = cookieStore.get(POST_AUTH_REDIRECT_COOKIE)?.value;
  const isPrototype = !!postAuthRedirect?.startsWith("/prototype");

  cookieStore.set(
    isPrototype ? PROTOTYPE_SESSION_COOKIE : ADMIN_SESSION_COOKIE,
    token,
    sessionCookieOptions(),
  );
  cookieStore.delete(LEGACY_SESSION_COOKIE);

  if (isPrototype) {
    cookieStore.delete(POST_AUTH_REDIRECT_COOKIE);
    return NextResponse.redirect(`${origin}${postAuthRedirect}`);
  }

  return NextResponse.redirect(`${origin}/dashboard/default`);
}
