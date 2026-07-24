// Persistent conversation memory for Shadow, the owner's voice assistant. One
// document per owner in `shadow_conversations`, holding a rolling LLM `summary`
// of older turns plus the most recent messages verbatim. This gives Shadow
// long-term memory (what was asked/assigned earlier) without unbounded context.

import { getDb } from "@/lib/mongodb";
import { complete, hasLLM } from "@/lib/groq";

const COLL = "shadow_conversations";
// Once the stored message log passes SUMMARIZE_AT, fold the oldest ones into the
// summary and keep only KEEP_RECENT verbatim.
const KEEP_RECENT = 24;
const SUMMARIZE_AT = 44;

export type StoredMsg = { role: "user" | "assistant"; content: string; at: string };

async function coll() {
  const db = await getDb();
  const c = db.collection(COLL);
  c.createIndex({ owner: 1 }, { unique: true }).catch(() => {});
  return c;
}

export async function getConversation(
  owner: string
): Promise<{ summary: string; messages: StoredMsg[] }> {
  const c = await coll();
  const doc = await c.findOne({ owner });
  return {
    summary: String(doc?.summary || ""),
    messages: Array.isArray(doc?.messages) ? (doc!.messages as StoredMsg[]) : [],
  };
}

/** Append one or more turns, then compress older history if it has grown large. */
export async function appendMessages(owner: string, msgs: StoredMsg[]) {
  if (!msgs.length) return;
  const c = await coll();
  const now = new Date().toISOString();
  await c.updateOne(
    { owner },
    {
      $push: { messages: { $each: msgs } },
      $setOnInsert: { owner, createdAt: now },
      $set: { updatedAt: now },
    } as never,
    { upsert: true }
  );
  await maybeSummarize(owner);
}

export async function clearConversation(owner: string) {
  const c = await coll();
  await c.updateOne(
    { owner },
    { $set: { summary: "", messages: [], updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
}

async function maybeSummarize(owner: string) {
  if (!hasLLM()) return;
  const c = await coll();
  const doc = await c.findOne({ owner });
  const messages: StoredMsg[] = Array.isArray(doc?.messages) ? (doc!.messages as StoredMsg[]) : [];
  if (messages.length <= SUMMARIZE_AT) return;

  const olderCount = messages.length - KEEP_RECENT;
  const older = messages.slice(0, olderCount);
  const recent = messages.slice(olderCount);
  const prev = String(doc?.summary || "");
  try {
    const summary = await summarize(prev, older);
    await c.updateOne(
      { owner },
      { $set: { summary, messages: recent, updatedAt: new Date().toISOString() } }
    );
  } catch {
    // Leave history intact if summarization fails; we'll retry next turn.
  }
}

async function summarize(prev: string, older: StoredMsg[]): Promise<string> {
  const convo = older
    .map((m) => `${m.role === "user" ? "Owner" : "Shadow"}: ${m.content}`)
    .join("\n");
  const system =
    "You maintain a running memory for Shadow, a business voice assistant used by a company owner. " +
    "Given the previous memory and an older slice of conversation, return an UPDATED concise memory " +
    "(max ~250 words). Capture the owner's ongoing tasks and requests, decisions made, stated " +
    "preferences, important facts about the business, and anything still pending or to-do. Write it " +
    "as durable notes for future turns — not a transcript. Plain text only.";
  const user = `Previous memory:\n${prev || "(none)"}\n\nOlder conversation to fold in:\n${convo}`;
  const out = await complete(system, user, false, 0.3);
  return out.trim().slice(0, 2000);
}
