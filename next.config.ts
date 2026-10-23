import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@napi-rs/canvas'],
  reactStrictMode: false,
  // Old URLs from before the (marketing) and (auth) route groups
  async redirects() {
    return [
      { source: '/marketing/:path*', destination: '/:path*', permanent: true },
      { source: '/auth/:path*', destination: '/:path*', permanent: true },
    ];
  },
};


export default nextConfig;
