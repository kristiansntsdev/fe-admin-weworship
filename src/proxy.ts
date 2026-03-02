import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "session_token";

// Routes that only admins can access
const ADMIN_ONLY_PATHS = ["/dashboard/analytics", "/dashboard/users"];

function decodeRole(token: string): "user" | "admin" | "maintainer" | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload.role === "admin") return "admin";
    if (payload.role === "maintainer") return "maintainer";
    return "user";
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get(AUTH_COOKIE)?.value;

  const isDashboard = pathname.startsWith("/dashboard");
  // /auth/callback must be reachable regardless of session state —
  // it is the landing page where Go drops the JWT after OAuth.
  const isAuthCallback = pathname.startsWith("/auth/callback");
  const isAuth = pathname.startsWith("/auth") && !isAuthCallback;

  // Protect dashboard routes — redirect to login if no session
  if (isDashboard && !sessionToken) {
    const loginUrl = new URL("/auth/v2/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control for dashboard
  if (isDashboard && sessionToken) {
    const role = decodeRole(sessionToken);

    // Invalid token → redirect to login
    if (!role) {
      const loginUrl = new URL("/auth/v2/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Valid token but insufficient role (plain user) → unauthorized
    if (role === "user") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Maintenancer cannot access admin-only paths
    if (role === "maintainer" && ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuth && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard/default", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
