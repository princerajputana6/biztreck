/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // Map the dot-prefixed /.well-known/* paths (which the App Router cannot host
  // directly, since folders beginning with "." are ignored) onto real route
  // handlers under /api/well-known/*.
  async rewrites() {
    return [
      {
        source: "/.well-known/api-catalog",
        destination: "/api/well-known/api-catalog",
      },
      {
        source: "/.well-known/agent-skills/index.json",
        destination: "/api/well-known/agent-skills/index",
      },
      {
        source: "/.well-known/agent-skills/:name/SKILL.md",
        destination: "/api/well-known/agent-skills/:name",
      },
    ];
  },
};

export default nextConfig;
