import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "session_token";
const BE = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

// Only the end-user endpoints the /prototype PWA needs are forwarded.
const ALLOWED_PREFIXES = ["auth/me", "songs", "artists", "playlists", "song-requests"];

type Params = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, { params }: Params) {
  const { path } = await params;
  const joined = path.map(encodeURIComponent).join("/");

  // Reject dot segments so a decoded "%2e%2e" can't step outside the allowlist once fetch normalises the URL.
  const hasDotSegment = path.some((s) => s === "." || s === "..");
  if (hasDotSegment || !ALLOWED_PREFIXES.some((p) => joined === p || joined.startsWith(`${p}/`))) {
    return NextResponse.json({ code: 404, message: "Not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  // Raw search string keeps %20 encoding — the Go search splits on spaces, not "+".
  const search = new URL(req.url).search;
  const hasBody = req.method === "POST" || req.method === "PUT";

  let res: Response;
  try {
    res = await fetch(`${BE}/api/${joined}${search}`, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: hasBody ? await req.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ code: 502, message: "Could not reach the server." }, { status: 502 });
  }

  const data = await res.json().catch(() => ({ code: res.status, message: res.statusText }));
  return NextResponse.json(data, { status: res.status });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE };
