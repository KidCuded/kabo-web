import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@napi-rs/canvas'],
  async headers() {
    return [
      {
        // Match all API routes under the Apple webhook path
        source: "/api/wallet/apple/webhook/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Update this to match your domain if needed
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ];
  },
};

export default nextConfig;
