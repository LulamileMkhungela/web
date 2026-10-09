import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allow the live preview host when running `next dev` behind the sandbox proxy.
  allowedDevOrigins: ['*.e2b.app', '*.e2b.dev'],
};

export default nextConfig;
