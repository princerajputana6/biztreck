import { NextResponse } from "next/server";
import { runMaintenance } from "@/lib/leados/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Scheduled LeadOS maintenance (see vercel.json): re-scan stale leads and email
 * an admin digest of high-priority leads still awaiting outreach.
 *
 * Triggered by Vercel Cron with `Authorization: Bearer ${CRON_SECRET}`.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runMaintenance();
    console.log(
      `[cron:leados-maintenance] rescanned=${result.rescanned}/${result.staleFound} uncontacted=${result.uncontacted} reminderSent=${result.reminderSent}`
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[cron:leados-maintenance] fatal", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Cron failed" },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
