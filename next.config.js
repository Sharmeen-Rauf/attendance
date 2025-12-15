/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove hardcoded localhost - use relative paths for Vercel deployment
  // For local dev, you can set NEXT_PUBLIC_API_URL in .env.local if needed
};

module.exports = nextConfig;

