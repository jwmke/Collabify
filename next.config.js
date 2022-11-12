/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: { appDir: true },
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
