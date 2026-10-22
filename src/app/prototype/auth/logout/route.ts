import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "session_token";

// Used by the Account page and by the client when the API answers 401 (expired Go JWT).
export function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const loginUrl = new URL("/prototype/login", req.url);
  if (from?.startsWith("/prototype")) {
    loginUrl.searchParams.set("from", from);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
