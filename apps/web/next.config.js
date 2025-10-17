/** @type {import('next').NextConfig} */
// For GitHub Pages with a custom domain (CNAME), serve from root without basePath
const basePath = '';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  }
};

module.exports = nextConfig;
