import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Enables standalone mode for Docker and dedicated servers, while preserving serverless compatibility (Vercel, Netlify, Cloud Run)
  ...(process.env.DOCKER_BUILD === 'true' || process.env.STANDALONE_BUILD === 'true'
    ? {
        output: 'standalone' as const,
        outputFileTracingRoot: path.join(__dirname),
      }
    : {}),
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
