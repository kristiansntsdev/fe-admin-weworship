import Link from "next/link";

import type { Metadata } from "next";

import { BETA_ERRORS } from "../../_lib/beta-access";
import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function PrototypeLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;
  // Set by /auth/callback when a Google sign-in is not on the closed-beta list (or the check failed).
  const betaError = error && Object.hasOwn(BETA_ERRORS, error) ? BETA_ERRORS[error as keyof typeof BETA_ERRORS] : null;
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
      {betaError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm"
        >
          {betaError}
        </p>
      )}
      <LoginForm from={safeFrom} />
    </AuthShell>
  );
}
