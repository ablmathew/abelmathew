import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  ...(isGitHubPagesBuild
    ? {
        output: "export" as const,
        basePath: "/abelmathew",
      }
    : {}),
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
