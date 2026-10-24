"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/session-cookies";

// Server actions call the BE directly (bypasses Next.js rewrites which are browser-only).
const API_URL = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

export async function login(
  email: string,
  password: string,
  redirectTo = "/dashboard/default",
  cookieName: string = ADMIN_SESSION_COOKIE,
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
  cookieStore.set(cookieName, token, sessionCookieOptions());
  cookieStore.delete(LEGACY_SESSION_COOKIE);

  redirect(redirectTo);
}

export async function register(username: string, email: string, password: string): Promise<{ error: string } | void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  } catch {
    return { error: "Could not reach the server. Please try again." };
  }

  const body = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    return { error: body.message ?? "Registration failed. Please try again." };
  }

  // Don't set session cookie — new accounts have role "user" which cannot access the dashboard.
  // Redirect to login so an admin can upgrade the role first.
  redirect("/auth/v2/login?registered=1");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  cookieStore.delete(LEGACY_SESSION_COOKIE);
  redirect("/auth/v2/login");
}
