"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE = "session_token";
// VERCEL_URL is automatically set by Vercel on every deployment.
// Locally, vercel dev serves both Next.js and Go on the same port.
const API_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

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

  const body = await res.json();

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

export async function register(email: string, _password: string): Promise<{ error: string }> {
  // Registration via email/password requires a backend endpoint — not yet implemented.
  // For now, direct users to use Google sign-in or contact an admin.
  return { error: "Email registration is not yet available. Please sign in with Google." };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/auth/v2/login");
}
