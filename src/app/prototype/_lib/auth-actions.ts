"use server";

import { cookies } from "next/headers";

import { login } from "@/server/auth-actions";

const AUTH_COOKIE = "session_token";
const API_URL = process.env.NEXT_PUBLIC_GO_URL ?? process.env.GO_DEV_URL ?? "http://localhost:3001";

// Only allow returning to prototype pages — prevents open redirects through ?from=.
function safeRedirect(from: string | null | undefined): string {
  return from?.startsWith("/prototype") ? from : "/prototype";
}

export async function prototypeLogin(email: string, password: string, from?: string | null) {
  return login(email, password, safeRedirect(from));
}

export async function prototypeRegister(
  username: string,
  email: string,
  password: string,
  from?: string | null,
): Promise<{ error: string }> {
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

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    return { error: body.message ?? "Registration failed. Please try again." };
  }

  // Register returns a token too, but logging in reuses the existing cookie + redirect handling.
  return login(email, password, safeRedirect(from));
}

// Not routed through the /api/prototype proxy: the BE returns a new token (the username lives in its claims)
// and only a server action can write it back to the httpOnly cookie.
export async function prototypeChangeUsername(username: string): Promise<{ username: string } | { error: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) {
    return { error: "Your session has expired. Please log in again." };
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/profile/username`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username }),
    });
  } catch {
    return { error: "Could not reach the server. Please try again." };
  }

  const body = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) {
    return { error: body.message ?? "Could not change your username. Please try again." };
  }

  const newToken: string | undefined = body.data?.token;
  if (!newToken) {
    return { error: "Could not change your username. Please try again." };
  }

  // Same options as login() in src/server/auth-actions.ts.
  cookieStore.set(AUTH_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return { username: body.data.user.username };
}
