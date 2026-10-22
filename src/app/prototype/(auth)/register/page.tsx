import Link from "next/link";

import type { Metadata } from "next";

import { AuthShell } from "../_components/auth-shell";
import { RegisterForm } from "../_components/register-form";

export const metadata: Metadata = { title: "Create account" };

export default async function PrototypeRegisterPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const safeFrom = from?.startsWith("/prototype") ? from : undefined;

  return (
    <AuthShell
      title="Create your account"
      description="Build playlists and share them with your worship team."
      from={safeFrom}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/prototype/login${safeFrom ? `?from=${encodeURIComponent(safeFrom)}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm from={safeFrom} />
    </AuthShell>
  );
}
