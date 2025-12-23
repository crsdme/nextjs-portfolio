import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    localPatterns: [
      { pathname: '/api/image/thumb/**' },
      { pathname: '/portfolio-logo.svg' },
      { pathname: '/merch-image.png' },
    ],
  },
}

export default nextConfig
