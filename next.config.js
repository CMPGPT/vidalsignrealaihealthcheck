/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress React warnings
  env: {
    SUPPRESS_REACT_WARNINGS: 'true',
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors during build
  },
  images: {
    domains: ['media.gettyimages.com', 'i.ibb.co.com'],
  },
  compiler: {
    // Allow suppressing hydration errors that are caused by browser extensions
    // adding extra attributes to div elements
    styledComponents: true,
    reactRemoveProperties:
      process.env.NODE_ENV === 'production'
        ? { properties: ['^bis_skin_checked$'] }
        : false,
  },
  // Suppress useLayoutEffect warnings in development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Suppress React warnings in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Stripe webhook configuration
  async headers() {
    return [
      {
        source: '/api/stripe/webhook',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;