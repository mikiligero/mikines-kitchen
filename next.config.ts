import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: 536870912, // 512MB in bytes
    },
  },
};

export default nextConfig;
