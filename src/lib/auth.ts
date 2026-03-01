import { cookies } from "next/headers";

const AUTH_COOKIE = "session_token";

export interface SessionUser {
  userId: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

// Decode a JWT payload without verifying the signature.
// Signature verification happens on the BE for every protected request.
function decodeJwtPayload(token: string): SessionUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → Base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(json);
    if (!payload.userId || !payload.email) return null;
    return {
      userId: payload.userId,
      name: payload.name ?? payload.email,
      email: payload.email,
      role: payload.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return decodeJwtPayload(token);
}
