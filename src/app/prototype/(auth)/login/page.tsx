import Link from "next/link";

import type { Metadata } from "next";

import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function PrototypeLoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const safeFrom = from?.startsWith("/prototype") ? from : undefined;

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to search songs and manage your playlists."
      from={safeFrom}
      footer={
        <>
          New to WeWorship?{" "}
          <Link
            href={`/prototype/register${safeFrom ? `?from=${encodeURIComponent(safeFrom)}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm from={safeFrom} />
    </AuthShell>
  );
}
