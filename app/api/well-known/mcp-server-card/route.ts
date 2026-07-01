import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/agent-tools";

export const dynamic = "force-static";

// MCP Server Card (SEP-1649). Reached at /.well-known/mcp/server-card.json via a
// rewrite. Describes the live MCP endpoint at /api/mcp.
export function GET() {
  const card = {
    serverInfo: { name: "biztreck-mcp", version: "1.0.0" },
    endpoint: `${SITE.url}/api/mcp`,
    transport: "streamable-http",
    protocolVersion: "2025-06-18",
    capabilities: ["tools"],
    tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
    description: `${SITE.name} MCP server — search and read blog content, list open roles, and contact the team.`,
  };
  return new Response(JSON.stringify(card, null, 2), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
}
