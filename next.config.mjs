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
    if (process.env.NODE_ENV !== "development") return [];
    const goApiUrl = process.env.GO_DEV_URL ?? "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${goApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
