/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    // Some brand logos (e.g. KuddlKin) are SVGs. next/image blocks SVG by
    // default; allow it but sandbox the response so an SVG can't execute script.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // pdfkit reads its AFM font-metric files (and we read public/logo.png) from
  // disk at runtime. Mark it external so webpack doesn't bundle it, and trace
  // the data files into the invoice PDF serverless function so they exist on
  // Vercel — otherwise the first doc.text() throws ENOENT and the route 500s.
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/admin/invoices/[id]/pdf": [
      "./node_modules/pdfkit/js/data/**/*",
      "./public/logo.png",
    ],
    "/api/admin/agreements/[clientId]/pdf": [
      "./node_modules/pdfkit/js/data/**/*",
      "./public/logo.png",
    ],
    "/api/admin/leados/[leadKey]/audit-pdf": [
      "./node_modules/pdfkit/js/data/**/*",
      "./public/logo.png",
    ],
    "/audit/[token]/pdf": [
      "./node_modules/pdfkit/js/data/**/*",
      "./public/logo.png",
    ],
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
      {
        source: "/.well-known/mcp/server-card.json",
        destination: "/api/well-known/mcp-server-card",
      },
      {
        source: "/.well-known/agent-card.json",
        destination: "/api/well-known/agent-card",
      },
      {
        source: "/auth.md",
        destination: "/api/auth-md",
      },
    ];
  },
};

export default nextConfig;
