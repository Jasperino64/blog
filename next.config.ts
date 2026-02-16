import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "agile-herring-965.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "doting-dotterel-409.convex.cloud",
      },
    ],
  },
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
