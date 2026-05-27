import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.17', 'localhost'],
  outputFileTracingRoot: path.join(__dirname, '../'),
};

export default nextConfig;
