import { SITE } from "@/lib/site";
import { TOOLS, findTool } from "@/lib/agent-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal Model Context Protocol server over Streamable HTTP (JSON-RPC 2.0).
// Advertised by /.well-known/mcp/server-card.json. Exposes Biztreck's real,
// public tools (blog search/read, open roles, contact) — no auth required.
const PROTOCOL_VERSION = "2025-06-18";

const SERVER_INFO = { name: "biztreck-mcp", version: "1.0.0" };

function rpcResult(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id, result });
}

function rpcError(id: unknown, code: number, message: string) {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id, method, params } = body || {};

  // Notifications (no id) — acknowledge with 202, no JSON-RPC body.
  if (id === undefined || id === null) {
    return new Response(null, { status: 202 });
  }

  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "Tools for discovering Biztreck Solutions content and contacting the team.",
      });

    case "ping":
      return rpcResult(id, {});

    case "tools/list":
      return rpcResult(id, {
        tools: TOOLS.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
      });

    case "tools/call": {
      const tool = findTool(params?.name);
      if (!tool) return rpcError(id, -32602, `Unknown tool: ${params?.name}`);
      try {
        const out = await tool.run(params?.arguments || {});
        return rpcResult(id, {
          content: [{ type: "text", text: out.text }],
          isError: false,
        });
      } catch (e: any) {
        return rpcResult(id, {
          content: [{ type: "text", text: `Tool error: ${e?.message || e}` }],
          isError: true,
        });
      }
    }

    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

// A GET gives humans/agents a readable hint about the endpoint.
export function GET() {
  return Response.json({
    server: SERVER_INFO,
    transport: "streamable-http",
    protocolVersion: PROTOCOL_VERSION,
    usage: "POST JSON-RPC 2.0 (initialize, tools/list, tools/call) to this URL.",
    serverCard: `${SITE.url}/.well-known/mcp/server-card.json`,
  });
}
