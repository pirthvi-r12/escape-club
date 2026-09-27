import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 68, 70, 72, 75, 76, 78, 80, 82, 84, 88],
    deviceSizes: [400, 640, 828, 1080, 1280, 1920, 2560, 3840],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "recharts"],
  },
  // three.js + globe.gl ship ESM-only sub-deps; keep them client-bundled.
  transpilePackages: ["three", "react-globe.gl", "globe.gl"],
};

export default nextConfig;
