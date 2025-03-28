/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

  // 👇 Middleware matcher for protecting specific routes
  matcher: ['/partners/:path*', '/chat/:path*'],
};

module.exports = nextConfig;
