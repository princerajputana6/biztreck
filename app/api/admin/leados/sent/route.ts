import { NextResponse } from "next/server";
import { guardPermission } from "@/lib/auth";
import { listSentEmails, countSentEmails } from "@/lib/leados/sent-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The verifiable log of outreach emails actually sent (via Resend/SMTP).
export async function GET(req: Request) {
  const session = await guardPermission("leados");
  if (!session) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const limit = Number(new URL(req.url).searchParams.get("limit") || 100);
  // Members see only the emails they sent; owners (admins) see all outreach.
  const scope = session.role === "owner" ? undefined : session.email;
  const [sent, total] = await Promise.all([
    listSentEmails(limit, scope),
    countSentEmails(scope),
  ]);
  return NextResponse.json({ ok: true, total, sent });
}
