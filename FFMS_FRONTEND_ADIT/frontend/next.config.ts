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
  // output: "export", // Incompatible with middleware.ts
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;