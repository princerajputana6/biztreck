import { randomUUID } from "crypto";
import { SITE } from "@/lib/site";
import { findTool } from "@/lib/agent-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal A2A (Agent-to-Agent) endpoint over JSON-RPC 2.0. Advertised by
// /.well-known/agent-card.json. Handles `message/send`: it reads the text of the
// incoming message, routes it to one of Biztreck's real tools, and replies with
// an agent Message. Public — no auth required.

function extractText(message: any): string {
  const parts = message?.parts || [];
  return parts
    .map((p: any) => (p?.kind === "text" || p?.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
}

async function respondTo(text: string): Promise<string> {
  const q = text.toLowerCase();
  if (/\b(job|jobs|role|roles|career|careers|hiring|vacanc)/.test(q)) {
    return (await findTool("list_open_roles")!.run({})).text;
  }
  if (/\b(contact|inquir|quote|hire you|reach|email you|get in touch)/.test(q)) {
    return `To send an inquiry, provide name, email and a message. You can also POST to ${SITE.url}/api/contact or email ${SITE.email}.`;
  }
  // Default: treat the message as a blog/content search query.
  return (await findTool("search_blog")!.run({ query: text })).text;
}

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

  if (method === "message/send") {
    const incoming = params?.message;
    const text = extractText(incoming);
    if (!text) return rpcError(id, -32602, "Message has no text part.");
    const reply = await respondTo(text);
    return rpcResult(id, {
      kind: "message",
      role: "agent",
      messageId: randomUUID(),
      contextId: params?.message?.contextId || randomUUID(),
      parts: [{ kind: "text", text: reply }],
    });
  }

  return rpcError(id ?? null, -32601, `Method not supported: ${method}`);
}

export function GET() {
  return Response.json({
    name: "Biztreck Solutions Agent",
    transport: "JSONRPC",
    usage: "POST JSON-RPC 2.0 method 'message/send' to this URL.",
    agentCard: `${SITE.url}/.well-known/agent-card.json`,
  });
}
