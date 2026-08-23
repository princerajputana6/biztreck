import { NextResponse } from "next/server";
import { leadsCollection, addTimelineEvent, setStage } from "@/lib/leados/db";
import { verifyRetellWebhook } from "@/lib/leados/calling";
import { optOutPatch } from "@/lib/leados/compliance";
import type { CallOutcome } from "@/lib/leados/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Retell posts call_started / call_ended / call_analyzed here. Configure this URL
// as the agent's webhook in the Retell dashboard. If you can't rely on the HMAC
// signature, append ?s=<RETELL_WEBHOOK_SECRET> to the URL as a fallback guard.

type RetellCall = {
  call_id: string;
  direction?: "inbound" | "outbound";
  call_status?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  disconnection_reason?: string;
  transcript?: string;
  recording_url?: string;
  metadata?: { leadKey?: string; initiatedBy?: string };
  call_analysis?: {
    call_summary?: string;
    user_sentiment?: string;
    call_successful?: boolean;
    custom_analysis_data?: Record<string, unknown>;
  };
};

function outcomeFrom(call: RetellCall): { outcome: CallOutcome; optedOut: boolean } {
  const d = call.call_analysis?.custom_analysis_data || {};
  const truthy = (v: unknown) => v === true || v === "true" || v === "yes";
  if (truthy(d.do_not_call)) return { outcome: "do_not_call", optedOut: true };
  if (truthy(d.meeting_requested) || truthy(d.meeting_booked))
    return { outcome: "meeting_booked", optedOut: false };
  if (truthy(d.interested)) return { outcome: "interested", optedOut: false };
  if (truthy(d.callback_requested)) return { outcome: "callback", optedOut: false };

  const reason = (call.disconnection_reason || "").toLowerCase();
  if (reason.includes("voicemail")) return { outcome: "voicemail", optedOut: false };
  if (reason.includes("no_answer") || reason.includes("dial_no_answer") || reason.includes("busy"))
    return { outcome: "no_answer", optedOut: false };
  if (reason.includes("error") || reason.includes("failed"))
    return { outcome: "failed", optedOut: false };
  return { outcome: "not_interested", optedOut: false };
}

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-retell-signature");
  const urlSecret = new URL(req.url).searchParams.get("s");

  if (!verifyRetellWebhook(raw, sig, urlSecret)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let body: { event?: string; call?: RetellCall };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const event = body.event;
  const call = body.call;
  const leadKey = call?.metadata?.leadKey;
  // Always 200 unknown/unmatched events so Retell doesn't retry forever.
  if (!call || !leadKey) return NextResponse.json({ ok: true, skipped: true });

  const col = await leadsCollection();
  const now = new Date().toISOString();
  const durationSec =
    call.start_timestamp && call.end_timestamp
      ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
      : undefined;

  // Patch the matching call record in place (matched by callId).
  const set: Record<string, unknown> = { "calls.$[c].status": call.call_status || event, updatedAt: now };
  if (durationSec != null) set["calls.$[c].durationSec"] = durationSec;
  if (call.disconnection_reason) set["calls.$[c].disconnectionReason"] = call.disconnection_reason;
  if (call.recording_url) set["calls.$[c].recordingUrl"] = call.recording_url;

  if (event === "call_analyzed" && call.call_analysis) {
    const a = call.call_analysis;
    const { outcome, optedOut } = outcomeFrom(call);
    set["calls.$[c].summary"] = a.call_summary || "";
    set["calls.$[c].sentiment"] = a.user_sentiment || "unknown";
    set["calls.$[c].successful"] = Boolean(a.call_successful);
    set["calls.$[c].data"] = a.custom_analysis_data || {};
    set["calls.$[c].outcome"] = outcome;

    await col.updateOne({ leadKey }, { $set: set } as never, {
      arrayFilters: [{ "c.callId": call.call_id }],
    });

    // Opt-out is a hard stop everywhere — apply and record.
    if (optedOut) {
      await col.updateOne({ leadKey }, { $set: optOutPatch("call") } as never);
      await setStage(leadKey, "lost");
      await addTimelineEvent(leadKey, {
        at: now, type: "call", summary: "Requested do-not-call on the call — opted out.",
        meta: { callId: call.call_id },
      });
      return NextResponse.json({ ok: true });
    }

    // Advance the pipeline based on how the call went.
    if (outcome === "meeting_booked") await setStage(leadKey, "meeting_scheduled");
    else if (outcome === "interested" || outcome === "callback") await setStage(leadKey, "replied");

    await addTimelineEvent(leadKey, {
      at: now,
      type: "call",
      summary: `AI call analyzed — ${outcome.replace(/_/g, " ")}. ${a.call_summary || ""}`.trim(),
      meta: { callId: call.call_id, sentiment: a.user_sentiment, data: a.custom_analysis_data },
    });
    return NextResponse.json({ ok: true });
  }

  // call_started / call_ended — just update the record's status/metrics.
  await col.updateOne({ leadKey }, { $set: set } as never, {
    arrayFilters: [{ "c.callId": call.call_id }],
  });

  if (event === "call_ended") {
    await addTimelineEvent(leadKey, {
      at: now,
      type: "call",
      summary: `AI call ended${durationSec != null ? ` (${durationSec}s)` : ""} — ${
        call.disconnection_reason || "completed"
      }.`,
      meta: { callId: call.call_id },
    });
  }

  return NextResponse.json({ ok: true });
}
