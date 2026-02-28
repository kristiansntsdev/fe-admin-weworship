const MESSAGES: Record<string, string> = {
  google_cancelled: "Google sign-in was cancelled. Please try again.",
  google_token_failed: "Failed to authenticate with Google. Please try again.",
  google_userinfo_failed: "Could not retrieve your Google account info. Please try again.",
};

export function OAuthError({ error }: { error?: string }) {
  if (!error) return null;
  const message = MESSAGES[error] ?? "An authentication error occurred. Please try again.";
  return (
    <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-destructive text-sm">{message}</p>
  );
}
