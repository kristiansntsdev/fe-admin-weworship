import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/session-cookies";
import { type NextRequest, NextResponse } from "next/server";

const BE = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

async function proxy(req: NextRequest, method: string, id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  const body = method !== "GET" ? await req.text() : undefined;

  const res = await fetch(`${BE}/api/admin/song-reports/${id}`, {
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(req, "PUT", id);
}
