import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// Custom robots.txt route handler (instead of the app/robots.ts metadata file)
// so we can emit Content-Signal directives — https://contentsignals.org/ —
// which the Next.js MetadataRoute.Robots type cannot express.
export function GET() {
  const body = `# robots.txt for ${SITE.name}
# Content Signals — https://contentsignals.org/
#   search=yes    : allow inclusion in search indexes
#   ai-input=yes  : allow use as input for AI answers (RAG / grounding)
#   ai-train=no   : do NOT use this content to train generative AI models
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /api/applications

Host: ${SITE.url}
Sitemap: ${SITE.url}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
}
