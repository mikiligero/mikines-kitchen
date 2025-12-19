import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: 536870912, // 512MB in bytes
      allowedOrigins: ['recetas.mikines.es', 'localhost:3000']
    },
  },
};

export default nextConfig;
