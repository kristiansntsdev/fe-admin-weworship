"use server";

import { login } from "@/server/auth-actions";

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
