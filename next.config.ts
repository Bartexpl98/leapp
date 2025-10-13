import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    turbo: {}, // Empty object instead of boolean to satisfy Turbopack
  },

  outputFileTracingRoot: __dirname,

  swcMinify: true,
};

export default nextConfig;
