import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    middlewareClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
