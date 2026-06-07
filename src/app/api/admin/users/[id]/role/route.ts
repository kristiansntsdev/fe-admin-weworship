import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "session_token";
const BE = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const body = await req.text();

  const res = await fetch(`${BE}/api/admin/users/${id}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  const data = await res.json().catch(() => ({ message: res.statusText }));
  return NextResponse.json(data, { status: res.status });
}
