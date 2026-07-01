import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// Served at /auth.md via a rewrite. Self-contained variant for sites without
// OAuth: Biztreck's agent-facing APIs are public, so this documents the (open)
// access model honestly rather than advertising an auth server that doesn't
// exist. H1 contains "auth.md" per the spec.
export function GET() {
  const body = `# auth.md — ${SITE.name}

## Audience
This document is for AI agents that want to interact with ${SITE.name}
programmatically.

## Authentication
**No authentication or registration is required.** All agent-facing endpoints are
public and read-only, except the contact endpoint which accepts anonymous
submissions. There is no OAuth authorization server, no client registration, and
no API keys.

## Endpoints
- MCP server (Streamable HTTP, JSON-RPC 2.0): \`${SITE.url}/api/mcp\`
  Discovery card: \`${SITE.url}/.well-known/mcp/server-card.json\`
- A2A endpoint (JSON-RPC 2.0): \`${SITE.url}/api/a2a\`
  Agent card: \`${SITE.url}/.well-known/agent-card.json\`
- REST: \`GET ${SITE.url}/api/blogs\`, \`GET ${SITE.url}/api/jobs\`,
  \`POST ${SITE.url}/api/contact\`
- API catalog: \`${SITE.url}/.well-known/api-catalog\`
- Agent skills: \`${SITE.url}/.well-known/agent-skills/index.json\`

## Credentials
None. Send requests without an Authorization header. Please set a descriptive
\`User-Agent\`. The contact endpoint is rate-sensitive; use it only for genuine
inquiries.

## Contact
For anything requiring a human: ${SITE.email}
`;
  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
}
