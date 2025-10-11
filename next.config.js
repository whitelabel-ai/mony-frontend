/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crm.whitelabel.lat',
      },
      {
        protocol: 'https',
        hostname: '**.mony.app',
      },
      {
        protocol: 'https',
        hostname: '**.whitelabel.lat',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig