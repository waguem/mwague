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
};

module.exports = nextConfig;
