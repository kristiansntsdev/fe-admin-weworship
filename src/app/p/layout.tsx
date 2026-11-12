import type { ReactNode } from "react";

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#960001",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Same brand colours as the /prototype app (see src/app/prototype/layout.tsx), without its session, query client or tab bar:
// published playlists are read by people who have no account.
const BRAND_STYLE = ":root{--primary:#960001!important;--primary-foreground:#fff!important;--ring:#960001!important}";

export default function PublishedPlaylistLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <style>{BRAND_STYLE}</style>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">{children}</div>
    </>
  );
}
