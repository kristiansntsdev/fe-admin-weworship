import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/session-cookies";

const BE = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const qs = req.nextUrl.search ?? "";

  const res = await fetch(`${BE}/api/admin/verification-requests${qs}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({ message: res.statusText }));
  return NextResponse.json(data, { status: res.status });
}
