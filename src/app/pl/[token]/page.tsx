import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Playlist – WeWorship",
  description: "You've been invited to collaborate on a worship playlist.",
};

export default async function PlaylistSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const deepLink = `weworship://playlist/${token}/join`;
  const expoGoDeepLink = `exp+weworship://playlist/${token}/join`;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Auto-redirect via meta refresh removed — handled by script below */}
      </head>
      <body
        style={{
          margin: 0,
          background: "#0a0505",
          color: "#fff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        {/* Glow blobs */}
        <div
          style={{
            position: "fixed",
            top: "-10%",
            left: "-10%",
            width: "50%",
            height: "50%",
            background: "rgba(148,0,0,0.25)",
            borderRadius: "50%",
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "fixed",
            bottom: "-10%",
            right: "-10%",
            width: "50%",
            height: "50%",
            background: "rgba(148,0,0,0.15)",
            borderRadius: "50%",
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            background: "#1a0b0b",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 32,
            padding: "40px 32px",
            width: "100%",
            maxWidth: 380,
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 56,
              height: 56,
              background: "#940000",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 24,
            }}
          >
            🎵
          </div>

          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 8,
              letterSpacing: "-0.3px",
            }}
          >
            Join this playlist
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            You&apos;ve been invited to collaborate on a worship playlist in
            WeWorship.
          </p>

          <a
            href={deepLink}
            style={{
              display: "block",
              width: "100%",
              padding: 16,
              background: "#940000",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 16,
              textDecoration: "none",
              marginBottom: 12,
              boxSizing: "border-box",
            }}
          >
            Open in WeWorship
          </a>
          <a
            href={expoGoDeepLink}
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              background: "transparent",
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              borderRadius: 16,
              textDecoration: "none",
              marginBottom: 4,
              boxSizing: "border-box",
            }}
          >
            Open in Expo Go (dev)
          </a>

          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              marginTop: 16,
            }}
          >
            Don&apos;t have the app? Download WeWorship from the App Store or
            Play Store.
          </p>
        </div>

        {/* Auto-redirect: try production scheme first, fallback to Expo Go scheme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var prod = ${JSON.stringify(deepLink)};
  var dev  = ${JSON.stringify(expoGoDeepLink)};
  // Only auto-redirect on non-iOS to avoid Safari "invalid address" error.
  // iOS requires a user gesture to open custom URL schemes.
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if(!isIOS){
    var hidden = false;
    document.addEventListener('visibilitychange', function(){ hidden = true; });
    window.addEventListener('blur', function(){ hidden = true; });
    window.location.href = prod;
    setTimeout(function(){ if(!hidden){ window.location.href = dev; } }, 1500);
  }
})();
`}}
        />
      </body>
    </html>
  );
}
