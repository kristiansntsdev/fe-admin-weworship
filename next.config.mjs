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
    // Proxy /api/* (except /api/admin/*) to the Go backend.
    // /api/admin/* are handled by Next.js route handlers (which add auth headers).
    const goApiUrl =
      process.env.NEXT_PUBLIC_GO_URL ??
      process.env.GO_DEV_URL ??
      "http://localhost:3001";
    return [
      {
        source: "/api/:path((?!admin/).*)",
        destination: `${goApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
