/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["source.unsplash.com", "images.unsplash.com", "unsplash.com"],
  },
  experimental: {
    optimizePackageImports: [
      '@mantine/core', 
      '@mantine/hooks',
      '@mantine/dates',
      '@mantine/notifications'
    ],
  }
};

module.exports = nextConfig;
