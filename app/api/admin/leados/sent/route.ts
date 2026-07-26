import { NextResponse } from "next/server";
import { guardPermission } from "@/lib/auth";
import { listSentEmails, countSentEmails } from "@/lib/leados/sent-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The verifiable log of outreach emails actually sent (via Resend/SMTP).
export async function GET(req: Request) {
  if (!(await guardPermission("leados"))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const limit = Number(new URL(req.url).searchParams.get("limit") || 100);
  const [sent, total] = await Promise.all([listSentEmails(limit), countSentEmails()]);
  return NextResponse.json({ ok: true, total, sent });
}
