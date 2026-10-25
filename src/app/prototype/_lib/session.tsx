"use client";

import { createContext, useContext, type ReactNode } from "react";

const SignedInContext = createContext(false);

export function PrototypeSessionProvider({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: ReactNode;
}) {
  return <SignedInContext.Provider value={signedIn}>{children}</SignedInContext.Provider>;
}

export function usePrototypeSignedIn() {
  return useContext(SignedInContext);
}

/** Login URL that returns the user to `from` after auth. */
export function prototypeLoginHref(from: string) {
  return `/prototype/login?from=${encodeURIComponent(from.startsWith("/prototype") ? from : "/prototype")}`;
}
