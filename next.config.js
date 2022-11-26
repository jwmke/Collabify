/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: { appDir: true, esmExternals: 'loose' },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "i.scdn.co"
      },
    ],
  }
}

module.exports = nextConfig
