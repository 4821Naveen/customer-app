import type { NextConfig } from "next";

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
const adminUrlObj = new URL(adminUrl);

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: adminUrlObj.protocol.replace(':', '') as 'http' | 'https',
        hostname: adminUrlObj.hostname,
        port: adminUrlObj.port || '',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${adminUrl}/uploads/:path*`, // Proxy to Admin App using env var
      },
    ];
  },
};

export default nextConfig;
