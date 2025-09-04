/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: '/home/runner/work/requirements-gathering-agent/requirements-gathering-agent',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-123',
  },
}

module.exports = nextConfig;
