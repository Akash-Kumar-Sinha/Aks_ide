import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
