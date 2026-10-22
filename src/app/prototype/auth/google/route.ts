import { type NextRequest, NextResponse } from "next/server";

// Read by /auth/callback after Google OAuth so the user lands back in the prototype.
const POST_AUTH_REDIRECT_COOKIE = "post_auth_redirect";

export function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const target = from?.startsWith("/prototype") ? from : "/prototype";

  const response = NextResponse.redirect(new URL("/api/auth/google?client=web", req.url));
  response.cookies.set(POST_AUTH_REDIRECT_COOKIE, target, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}
