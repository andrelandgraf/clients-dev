import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/clients/:id.md", destination: "/markdown/:id" },
      ],
    };
  },
};

export default nextConfig;
