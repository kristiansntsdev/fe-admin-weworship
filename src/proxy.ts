import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "session_token";

// Routes that only admins can access
const ADMIN_ONLY_PATHS = ["/dashboard/analytics", "/dashboard/users"];

// /prototype pages reachable without a session (auth/* holds the Google + logout route handlers)
const PROTOTYPE_PUBLIC_PATHS = ["/prototype/login", "/prototype/register", "/prototype/auth"];

function decodePayload(token: string): { role?: string; exp?: number } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function decodeRole(token: string): "user" | "admin" | "maintainer" | null {
  const payload = decodePayload(token);
  if (!payload) return null;
  if (payload.role === "admin") return "admin";
  if (payload.role === "maintainer") return "maintainer";
  return "user";
}

function isExpired(token: string): boolean {
  const exp = decodePayload(token)?.exp;
  return typeof exp === "number" && exp * 1000 <= Date.now();
}

function redirectToLogin(req: NextRequest, pathname: string, clearSession = false, loginPath = "/auth/v2/login") {
  const loginUrl = new URL(loginPath, req.url);
  loginUrl.searchParams.set("from", pathname);
  const response = NextResponse.redirect(loginUrl);
  if (clearSession) {
    response.cookies.delete(AUTH_COOKIE);
  }
  return response;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get(AUTH_COOKIE)?.value;

  const isDashboard = pathname.startsWith("/dashboard");
  // /auth/callback must be reachable regardless of session state —
  // it is the landing page where Go drops the JWT after OAuth.
  const isAuthCallback = pathname.startsWith("/auth/callback");
  const isAuth = pathname.startsWith("/auth") && !isAuthCallback;

  const isPrototype = pathname === "/prototype" || pathname.startsWith("/prototype/");
  const isPrototypePublic = PROTOTYPE_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  // The home landing page is open to signed-out visitors. Kept out of PROTOTYPE_PUBLIC_PATHS: those redirect
  // signed-in users to /prototype, which would loop here.
  const isPrototypeHome = pathname === "/prototype";

  // Protect prototype routes — any role may use the end-user app, but the token must be valid and unexpired
  // (the Go JWT expires long before the cookie does, so an expired token would otherwise loop on 401).
  if (isPrototype && !isPrototypePublic && !isPrototypeHome) {
    if (!sessionToken) {
      return redirectToLogin(req, pathname, false, "/prototype/login");
    }
    if (!decodeRole(sessionToken) || isExpired(sessionToken)) {
      return redirectToLogin(req, pathname, true, "/prototype/login");
    }
  }

  // Redirect authenticated users away from prototype login/register into the app home tab
  if (isPrototypePublic && !pathname.startsWith("/prototype/auth") && sessionToken && !isExpired(sessionToken)) {
    return NextResponse.redirect(new URL("/prototype/home", req.url));
  }

  // Protect dashboard routes — redirect to login if no session
  if (isDashboard && !sessionToken) {
    return redirectToLogin(req, pathname);
  }

  // Role-based access control for dashboard
  if (isDashboard && sessionToken) {
    const role = decodeRole(sessionToken);

    // Invalid token → redirect to login
    if (!role) {
      return redirectToLogin(req, pathname, true);
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
