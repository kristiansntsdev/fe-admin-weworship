import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Account Deletion – WeWorship",
  description: "Submit a request to delete your WeWorship account and all associated data.",
};

const API_URL = process.env.NEXT_PUBLIC_GO_URL ?? "http://localhost:3001";

export default function AccountDeletionPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        style={{
          margin: 0,
          background: "#0a0505",
          color: "#fff",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        {/* Background glows */}
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
            maxWidth: 420,
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
              textAlign: "center",
            }}
          >
            Delete Your Account
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 28,
              textAlign: "center",
            }}
          >
            Enter your account email below to submit a deletion request. Your account
            and all associated data will be permanently removed within{" "}
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>30 days</strong>.
          </p>

          {/* Form */}
          <form id="deletion-form" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              id="email-input"
              type="email"
              placeholder="your@email.com"
              required
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "14px 16px",
                color: "#fff",
                fontSize: 15,
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <button
              id="submit-btn"
              type="submit"
              style={{
                display: "block",
                width: "100%",
                padding: 16,
                background: "#940000",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              Submit Deletion Request
            </button>
          </form>

          {/* Status message */}
          <div id="status-msg" style={{ marginTop: 16, fontSize: 14, textAlign: "center", display: "none" }} />

          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              marginTop: 24,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            This request covers all personal data including your profile, playlists,
            and activity history. This action cannot be undone.
          </p>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var API = ${JSON.stringify(API_URL)};
  var form = document.getElementById('deletion-form');
  var btn = document.getElementById('submit-btn');
  var msg = document.getElementById('status-msg');

  function showMsg(text, color) {
    msg.textContent = text;
    msg.style.color = color;
    msg.style.display = 'block';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('email-input').value.trim().toLowerCase();
    if (!email) return;

    btn.disabled = true;
    btn.textContent = 'Submitting…';
    msg.style.display = 'none';

    fetch(API + '/api/account/deletion-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.code === 200) {
          form.style.display = 'none';
          showMsg('✓ ' + data.message, 'rgba(100,255,150,0.9)');
        } else {
          btn.disabled = false;
          btn.textContent = 'Submit Deletion Request';
          showMsg(data.message || 'Something went wrong. Please try again.', 'rgba(255,100,100,0.9)');
        }
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Submit Deletion Request';
        showMsg('Network error. Please check your connection and try again.', 'rgba(255,100,100,0.9)');
      });
  });
})();
`,
          }}
        />
      </body>
    </html>
  );
}
