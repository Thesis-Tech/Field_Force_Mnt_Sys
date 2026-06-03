import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost.com",
    "localhost",
    "192.168.1.17",
    "192.168.1.20",
  ],
  outputFileTracingRoot: path.join(__dirname, "../"),
  // Required for Cloudflare Pages (next-on-pages)
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;