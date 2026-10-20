import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@napi-rs/canvas'],
  reactStrictMode: false,
};


export default nextConfig;
