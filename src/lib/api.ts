import { cookies } from "next/headers";

const AUTH_COOKIE = "session_token";

// Determine the internal API base URL.
// On Vercel, VERCEL_URL is set automatically.
// Locally (next dev), the Next.js rewrite in next.config.mjs forwards /api/* to Go.
function apiBase(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.GO_DEV_URL ?? "http://localhost:3001";
}

export interface ApiError {
  status: number;
  message: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({ message: res.statusText }));

  if (!res.ok) {
    throw new Error(body.message ?? "Request failed");
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<ApiResponse<T>>(path),
  post: <T>(path: string, data: unknown) =>
    request<ApiResponse<T>>(path, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) =>
    request<ApiResponse<T>>(path, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(path: string) =>
    request<ApiResponse<T>>(path, { method: "DELETE" }),
};
