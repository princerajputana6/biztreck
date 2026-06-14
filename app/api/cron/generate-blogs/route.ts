import { NextResponse } from "next/server";
import { autoPublishBlogs } from "@/lib/auto-publish-blogs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const COUNT = 5;

/**
 * Daily cron: discover 5 trending topics, generate full blog posts for each,
 * and insert them as published blogs.
 *
 * Triggered by Vercel Cron (see vercel.json). Vercel sends:
 *   Authorization: Bearer ${CRON_SECRET}
 * Set CRON_SECRET in Vercel project env.
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
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await autoPublishBlogs(COUNT, "cron");
    console.log(
      `[cron:generate-blogs] inserted=${result.inserted.length} failed=${result.failed.length} duration=${result.durationMs}ms`
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[cron:generate-blogs] fatal", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Cron failed" },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
