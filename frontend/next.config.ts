import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.icons8.com' }
    ]
  },
  reactStrictMode: true,
  devIndicators: false
}

export default nextConfig
