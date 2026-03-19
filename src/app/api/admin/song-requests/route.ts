import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_COOKIE = "session_token";
const BE = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

async function proxy(req: NextRequest, method: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const qs = req.nextUrl.search ?? "";
  const res = await fetch(`${BE}/api/admin/song-requests${qs}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({ message: res.statusText }));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest) {
  return proxy(req, "GET");
}
