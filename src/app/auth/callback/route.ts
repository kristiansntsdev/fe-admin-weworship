import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "session_token";

// Go redirects here after successful Google OAuth:
//   GET /auth/callback?token=<JWT>
// We store the JWT in an httpOnly cookie and redirect to the dashboard.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/auth/v2/login?error=google_failed`);
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return NextResponse.redirect(`${origin}/dashboard/default`);
}
