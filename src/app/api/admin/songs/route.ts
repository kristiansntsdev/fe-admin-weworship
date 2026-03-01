import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_COOKIE = "session_token";
const BE = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

async function proxy(req: NextRequest, method: string, id?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const path = id ? `/api/admin/songs/${id}` : "/api/admin/songs";
  const body = method !== "DELETE" ? await req.text() : undefined;

  const res = await fetch(`${BE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  const data = await res.json().catch(() => ({ message: res.statusText }));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  return proxy(req, "POST");
}
