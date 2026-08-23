// LeadOS — AI voice calling via Retell.
//
// Thin, dependency-free client over Retell's REST API. `placeCall` is the only
// way to start an outbound call: it runs the compliance gate first, builds the
// per-lead context the agent speaks from, dials via Retell, and records the
// attempt on the lead. The webhook route (app/api/webhooks/retell) closes the
// loop with the result.
//
// Env:
//   RETELL_API_KEY        — secret key from the Retell dashboard
//   RETELL_FROM_NUMBER    — a number you own in Retell, E.164 (e.g. +14155550123)
//   RETELL_AGENT_ID       — the published agent that runs the conversation
//   RETELL_WEBHOOK_SECRET — optional shared token guarding the webhook URL

import { createHmac, timingSafeEqual } from "node:crypto";
import { leadsCollection, addTimelineEvent } from "./db";
import { evaluateCall, type CallDecision } from "./compliance";
import type { Lead, CallRecord } from "./types";

const RETELL_BASE = "https://api.retellai.com";

export function retellConfigured(): boolean {
  return Boolean(
    process.env.RETELL_API_KEY &&
      process.env.RETELL_FROM_NUMBER &&
      process.env.RETELL_AGENT_ID
  );
}

/**
 * The variables injected into the agent's prompt (Retell `{{var}}` placeholders).
 * Everything the agent needs to sound like it actually knows this business — and
 * the mandatory AI self-disclosure line.
 */
export function buildDynamicVariables(lead: Lead): Record<string, string> {
  const contact = (lead.contacts || []).find((c) => c.name) || {};
  const topOpp = (lead.opportunities || [])
    .slice()
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];

  return {
    company_name: "Biztreck Solutions",
    caller_name: "Aria",
    // Mandatory disclosure — spoken in the first breath. Do not remove.
    ai_disclosure:
      "Hi, this is Aria, an AI assistant calling on behalf of Biztreck Solutions.",
    lead_business: lead.businessName || "there",
    lead_contact_name: contact.name || "",
    lead_city: lead.city || "",
    lead_country: lead.country || "",
    lead_industry: lead.businessCategory || lead.intel?.industry || "",
    lead_website: lead.website || "",
    top_opportunity: topOpp?.service ? String(topOpp.service) : "",
    top_opportunity_reason: topOpp?.rationale || "",
    audit_headline: lead.audit?.headline || "",
    website_score: lead.analysis ? String(lead.analysis.score) : "",
    booking_link: process.env.LEADOS_BOOKING_LINK || "https://biztreck.world",
  };
}

export type PlaceCallResult =
  | { ok: true; callId: string; decision: CallDecision }
  | { ok: false; error: string; decision?: CallDecision; status: number };

/** Start an outbound AI call to a lead. Compliance gate is non-negotiable. */
export async function placeCall(
  lead: Lead,
  initiatedBy = "leados"
): Promise<PlaceCallResult> {
  if (!retellConfigured()) {
    return { ok: false, error: "Retell is not configured (missing env).", status: 503 };
  }

  const decision = evaluateCall(lead);
  if (!decision.allowed || !decision.e164) {
    return {
      ok: false,
      error: `Blocked by compliance: ${decision.blocks.join(" ")}`,
      decision,
      status: 409,
    };
  }

  const res = await fetch(`${RETELL_BASE}/v2/create-phone-call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_number: process.env.RETELL_FROM_NUMBER,
      to_number: decision.e164,
      override_agent_id: process.env.RETELL_AGENT_ID,
      // Echoed back on every webhook so we can find the lead again.
      metadata: { leadKey: lead.leadKey, initiatedBy },
      retell_llm_dynamic_variables: buildDynamicVariables(lead),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `Retell error ${res.status}: ${detail}`, status: 502 };
  }

  const data = (await res.json()) as { call_id: string; call_status?: string };
  const now = new Date().toISOString();

  const record: CallRecord = {
    callId: data.call_id,
    at: now,
    status: data.call_status || "registered",
    direction: "outbound",
    initiatedBy,
  };

  // Record the attempt immediately; the webhook enriches it later.
  const col = await leadsCollection();
  await col.updateOne(
    { leadKey: lead.leadKey },
    { $push: { calls: record }, $set: { lastCalledAt: now, lastContactedAt: now, updatedAt: now } } as never
  );
  await addTimelineEvent(lead.leadKey, {
    at: now,
    type: "call",
    summary: `AI call started to ${decision.e164}`,
    meta: { callId: data.call_id, initiatedBy },
  });

  return { ok: true, callId: data.call_id, decision };
}

/**
 * Verify a Retell webhook. Primary: HMAC-SHA256 of the raw body with the API
 * key, compared to the `x-retell-signature` header (Retell's scheme; the
 * official SDK's `Retell.verify` does the same). Fallback: a shared secret in
 * the URL when you can't compute the HMAC. Returns true if either passes.
 */
export function verifyRetellWebhook(
  rawBody: string,
  signature: string | null,
  urlSecret?: string | null
): boolean {
  const apiKey = process.env.RETELL_API_KEY || "";
  if (signature && apiKey) {
    try {
      const expected = createHmac("sha256", apiKey).update(rawBody).digest("hex");
      const a = Buffer.from(expected);
      const b = Buffer.from(signature.replace(/^v=?/, ""));
      if (a.length === b.length && timingSafeEqual(a, b)) return true;
    } catch {
      /* fall through to secret check */
    }
  }
  const configured = process.env.RETELL_WEBHOOK_SECRET;
  if (configured && urlSecret && urlSecret === configured) return true;
  return false;
}
