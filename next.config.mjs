/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    // On Vercel, @vercel/go handles /api/* directly.
    // This rewrite is only active during local `next dev` (not vercel dev).
    // Exclude /api/admin/* — those are handled by Next.js proxy routes (which add auth).
    if (process.env.NODE_ENV !== "development") return [];
    const goApiUrl = process.env.GO_DEV_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/((?!admin/).*)",
        destination: `${goApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
