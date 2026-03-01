import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_COOKIE = "session_token";
const BE = process.env.GO_DEV_URL ?? "http://localhost:3001";

async function proxy(req: NextRequest, method: string, id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const body = method !== "DELETE" ? await req.text() : undefined;

  const res = await fetch(`${BE}/api/admin/songs/${id}`, {
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxy(req, "DELETE", id);
}
