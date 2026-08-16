import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
