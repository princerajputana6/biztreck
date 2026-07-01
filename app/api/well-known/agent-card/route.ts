import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// A2A Agent Card. Reached at /.well-known/agent-card.json via a rewrite.
// Describes the live A2A endpoint at /api/a2a. Includes standard A2A fields plus
// a supportedInterfaces array (service URL + transport). Skills each carry
// id, name and description.
export function GET() {
  const url = `${SITE.url}/api/a2a`;
  const card = {
    protocolVersion: "0.2.5",
    name: "Biztreck Solutions Agent",
    version: "1.0.0",
    description:
      "Agent-to-agent interface for Biztreck Solutions — search and read blog content, list open roles, and route sales/project inquiries to the team.",
    url,
    preferredTransport: "JSONRPC",
    supportedInterfaces: [{ url, transport: "JSONRPC" }],
    provider: { organization: SITE.name, url: SITE.url },
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    skills: [
      {
        id: "search_blog",
        name: "Search blog content",
        description:
          "Search Biztreck Solutions blog articles by keyword and return titles, excerpts and links.",
        tags: ["content", "search", "blog"],
        examples: ["Find articles about Next.js performance"],
      },
      {
        id: "list_open_roles",
        name: "List open roles",
        description:
          "List current open job positions at Biztreck Solutions with location and type.",
        tags: ["careers", "jobs"],
        examples: ["What roles are open right now?"],
      },
      {
        id: "contact_biztreck",
        name: "Contact the team",
        description:
          "Route a sales or project inquiry to the Biztreck Solutions team.",
        tags: ["contact", "sales"],
        examples: ["I'd like a quote for a mobile app"],
      },
    ],
  };
  return new Response(JSON.stringify(card, null, 2), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600, must-revalidate",
    },
  });
}
