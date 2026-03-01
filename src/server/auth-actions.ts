"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE = "session_token";
// Server actions call the BE directly (bypasses Next.js rewrites which are browser-only).
const API_URL = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

export async function login(
  email: string,
  password: string,
  redirectTo = "/dashboard/default",
): Promise<{ error: string }> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { error: "Could not reach the server. Please try again." };
  }

  const body = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    return { error: body.message ?? "Invalid email or password." };
  }

  const token: string | undefined = body.data?.token;
  if (!token) {
    return { error: "Authentication failed. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  redirect(redirectTo);
}

export async function register(name: string, email: string, password: string): Promise<{ error: string } | void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
  } catch {
    return { error: "Could not reach the server. Please try again." };
  }

  const body = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    return { error: body.message ?? "Registration failed. Please try again." };
  }

  const token: string | undefined = body.data?.token;
  if (!token) {
    return { error: "Registration failed. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect("/dashboard/default");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/auth/v2/login");
}
