const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // The shared contract package ships TypeScript source; Next must compile it
  // rather than treat it as a prebuilt dependency.
  transpilePackages: ['@pagepulse/shared-types'],

  eslint: {
    // Lint is a separate CI step; don't fail production builds on style.
    ignoreDuringBuilds: false,
  },

  images: {
    remotePatterns: [
      // Favicons rendered next to audited URLs in results and history.
      { protocol: 'https', hostname: 'www.google.com', pathname: '/s2/favicons' },
    ],
  },
};

module.exports = nextConfig;