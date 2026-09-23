/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'www.figma.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/lp/:path*',
        destination: 'https://lp.donghoadesign.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
