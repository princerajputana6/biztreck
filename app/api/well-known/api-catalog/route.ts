import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// RFC 9727 API catalog, served as application/linkset+json (RFC 9264).
// Reached at /.well-known/api-catalog via a rewrite in next.config.mjs.
export function GET() {
  const base = SITE.url;
  const linkset = {
    linkset: [
      {
        anchor: `${base}/api`,
        "service-doc": [{ href: `${base}/llms.txt`, type: "text/plain" }],
        describedby: [
          {
            href: `${base}/.well-known/agent-skills/index.json`,
            type: "application/json",
          },
        ],
        status: [{ href: `${base}/api/health`, type: "application/json" }],
      },
      {
        anchor: `${base}/api/blogs`,
        "service-doc": [
          {
            href: `${base}/.well-known/agent-skills/content/SKILL.md`,
            type: "text/markdown",
          },
        ],
        status: [{ href: `${base}/api/health`, type: "application/json" }],
      },
      {
        anchor: `${base}/api/jobs`,
        "service-doc": [
          {
            href: `${base}/.well-known/agent-skills/content/SKILL.md`,
            type: "text/markdown",
          },
        ],
        status: [{ href: `${base}/api/health`, type: "application/json" }],
      },
      {
        anchor: `${base}/api/contact`,
        "service-doc": [
          {
            href: `${base}/.well-known/agent-skills/contact/SKILL.md`,
            type: "text/markdown",
          },
        ],
      },
    ],
  };

  return new Response(JSON.stringify(linkset, null, 2), {
    headers: {
      "content-type": "application/linkset+json",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
}
