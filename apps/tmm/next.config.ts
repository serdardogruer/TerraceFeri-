import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['192.168.0.124', '192.168.0.124:3005', 'localhost:3005', 'localhost', '127.0.0.1'],
  serverExternalPackages: [
    '@prisma-clients/apartment',
    '@prisma-clients/core',
    '@prisma-clients/equipment',
    '@prisma-clients/fault',
    '@prisma-clients/area',
    '@prisma-clients/company'
  ],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
