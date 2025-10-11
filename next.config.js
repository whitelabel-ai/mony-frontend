/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  swcMinify: true,
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
  poweredByHeader: false,
}

module.exports = nextConfig