// Anthropic (Claude) client — powers the Shadow agent's reasoning and drafting
// when ANTHROPIC_API_KEY is set. lib/groq.ts routes any model id that starts
// with "claude-" through here, so Shadow runs on Claude while the rest of the
// app can stay on OpenRouter. Defaults: the agent's brain uses the best Claude
// model (Opus 5) for accuracy; fast bulk drafting uses Haiku 4.5 for speed.

import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

/** The agent's primary reasoning model (accurate). Override with ANTHROPIC_MODEL. */
export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
/** A fast, cheap Claude model for high-volume drafting. Override with ANTHROPIC_FAST_MODEL. */
export const ANTHROPIC_FAST_MODEL = process.env.ANTHROPIC_FAST_MODEL || "claude-haiku-4-5";

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  if (!_client) _client = new Anthropic({ apiKey });
  return _client;
}

/** True when an Anthropic key is configured (so callers can prefer Claude). */
export function hasAnthropic(): boolean {
  return Boolean(apiKey);
}

/** A native Claude model id (e.g. "claude-opus-5"), NOT an OpenRouter "anthropic/…" id. */
export function isClaudeModel(model?: string): boolean {
  return typeof model === "string" && /^claude-/.test(model);
}

// The 5-series and Opus 4.7/4.8 REJECT temperature/top_p/top_k (400) and use
// adaptive-thinking + effort controls instead. Older models (Haiku 4.5) accept
// temperature and don't support effort. Route request shape by family.
function isModernClaude(model: string): boolean {
  return /(opus-5|sonnet-5|fable-5|mythos-5|opus-4-8|opus-4-7)/.test(model);
}

export type ClaudeMsg = { role: "user" | "assistant"; content: string };
export type ClaudeOpts = { json?: boolean; temperature?: number; model?: string; maxTokens?: number };

// Models occasionally wrap JSON in prose/fences; recover the raw object so
// downstream JSON.parse stays reliable.
function extractJson(text: string): string {
  let t = text.trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) t = fence[1].trim();
  if (t.startsWith("{") || t.startsWith("[")) return t;
  const starts = [t.indexOf("{"), t.indexOf("[")].filter((i) => i >= 0);
  if (!starts.length) return t;
  const start = Math.min(...starts);
  const end = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  return end > start ? t.slice(start, end + 1) : t;
}

async function callClaude(
  system: string,
  messages: ClaudeMsg[],
  opts: ClaudeOpts
): Promise<string> {
  const model = opts.model || ANTHROPIC_MODEL;
  const modern = isModernClaude(model);
  // A firm JSON instruction keeps output clean even with thinking disabled
  // (generic "no internal/system XML tags" guard, per Anthropic guidance).
  const sys = opts.json
    ? `${system}\n\nRespond with ONLY a single valid JSON object — no preamble, no explanation, no markdown code fences, and no internal or system XML tags.`
    : system;

  const params: Record<string, unknown> = {
    model,
    max_tokens: opts.maxTokens ?? (opts.json ? 1200 : 1024),
    system: sys,
    messages,
  };
  if (modern) {
    // Disable thinking + low effort → the fastest turnaround for structured
    // tool-planning turns (voice latency matters far more than deep reasoning
    // here). Sampling params are rejected on these models, so we omit them.
    params.thinking = { type: "disabled" };
    params.output_config = { effort: "low" };
  } else {
    params.temperature = opts.temperature ?? 0.4;
  }

  // These beta-ish fields (thinking/output_config) can outrun the SDK typings,
  // so build the body loosely and read the response defensively.
  const msg = (await client().messages.create(params as never)) as {
    content?: { type?: string; text?: string }[];
  };
  const text = (msg.content || [])
    .filter((b) => b?.type === "text")
    .map((b) => b.text || "")
    .join("")
    .trim();
  return opts.json ? extractJson(text) : text;
}

/** Single-shot Claude completion (system + one user turn). */
export function anthropicComplete(
  system: string,
  user: string,
  opts: ClaudeOpts = {}
): Promise<string> {
  return callClaude(system, [{ role: "user", content: user }], opts);
}

/**
 * Multi-turn Claude chat. Accepts the app's ChatMessage shape (which may include
 * leading `system` turns); system content is hoisted into Anthropic's top-level
 * `system` and the rest are passed as the conversation.
 */
export function anthropicChat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts: ClaudeOpts = {}
): Promise<string> {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const turns: ClaudeMsg[] = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
  // Anthropic requires the first message to be a user turn.
  if (!turns.length || turns[0].role !== "user") {
    turns.unshift({ role: "user", content: "(continue)" });
  }
  return callClaude(system, turns, opts);
}
