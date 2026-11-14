import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/abelmathew",
  trailingSlash: true,
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
