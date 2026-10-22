import type { ReactNode } from "react";

import type { Metadata, Viewport } from "next";

import { Providers } from "./_components/providers";

export const metadata: Metadata = {
  title: { default: "WeWorship", template: "%s · WeWorship" },
  description: "Search worship songs, build playlists and share them with your team.",
  manifest: "/prototype.webmanifest",
  appleWebApp: { capable: true, title: "WeWorship", statusBarStyle: "default" },
  icons: { icon: "/prototype-icons/icon-192.png", apple: "/prototype-icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#960001",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// WeWorship brand red (mobile constants/theme.ts Brand.primary). Applied on :root with !important so it beats the
// admin theme presets and also reaches portalled dialogs/drawers; it is only mounted while a /prototype page is open.
const BRAND_STYLE = ":root{--primary:#960001!important;--primary-foreground:#fff!important;--ring:#960001!important}";

export default function PrototypeLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <style>{BRAND_STYLE}</style>
      <Providers>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">{children}</div>
      </Providers>
    </>
  );
}
