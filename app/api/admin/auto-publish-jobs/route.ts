import { NextResponse } from "next/server";
import { guardPermission } from "@/lib/auth";
import { autoPublishJobs } from "@/lib/auto-publish-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DEFAULT_COUNT = 3;
const MAX_COUNT = 6;

/**
 * Admin-triggered: discover N in-demand roles and publish full job postings.
 * Gated by the admin session cookie. Body (optional): { count?: number }
 */
export async function POST(req: Request) {
  if (!(await guardPermission("ai-publishing"))) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let count = DEFAULT_COUNT;
  try {
    const body = (await req.json().catch(() => ({}))) as { count?: number };
    if (typeof body.count === "number" && body.count > 0) {
      count = Math.min(Math.floor(body.count), MAX_COUNT);
    }
  } catch {
    // Ignore — empty body is fine.
  }

  try {
    const result = await autoPublishJobs(count, "admin");
    console.log(
      `[admin:auto-publish-jobs] inserted=${result.inserted.length} failed=${result.failed.length} duration=${result.durationMs}ms`
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[admin:auto-publish-jobs] fatal", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Auto-publish failed" },
      { status: 500 }
    );
  }
}
