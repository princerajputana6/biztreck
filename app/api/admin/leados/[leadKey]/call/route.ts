import { NextResponse } from "next/server";
import { guardPermission } from "@/lib/auth";
import { getLeadByKey } from "@/lib/leados/db";
import { evaluateCall } from "@/lib/leados/compliance";
import { placeCall, retellConfigured } from "@/lib/leados/calling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET — dry run: show whether this lead can be called, and why/why not.
// Lets the UI render the compliance gate before anyone clicks "Call".
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadKey: string }> }
) {
  const session = await guardPermission("leados");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { leadKey } = await params;
  const lead = await getLeadByKey(leadKey);
  if (!lead || (session.role !== "owner" && (lead.ownerEmail || "") !== session.email)) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    configured: retellConfigured(),
    decision: evaluateCall(lead),
  });
}

// POST — place the AI call. The compliance gate lives in placeCall(); a blocked
// call returns 409 with the reasons rather than dialing.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ leadKey: string }> }
) {
  const session = await guardPermission("leados");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const { leadKey } = await params;
  const lead = await getLeadByKey(leadKey);
  if (!lead || (session.role !== "owner" && (lead.ownerEmail || "") !== session.email)) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  const result = await placeCall(lead, session.sub || "leados");
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, decision: result.decision },
      { status: result.status }
    );
  }
  return NextResponse.json({ ok: true, callId: result.callId, decision: result.decision });
}
