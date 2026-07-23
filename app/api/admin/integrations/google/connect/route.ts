import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { guardPermission } from "@/lib/auth";
import { buildGoogleAuthUrl, googleConfigured } from "@/lib/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Starts the Google OAuth flow (admin only). Redirects the browser to Google's
// consent screen with a signed, short-lived state for CSRF protection.
export async function GET() {
  if (!(await guardPermission("integrations"))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!googleConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Google OAuth env vars are not configured." },
      { status: 400 }
    );
  }
  const ts = Date.now().toString();
  const sig = createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "x")
    .update(`google.${ts}`)
    .digest("hex");
  return NextResponse.redirect(buildGoogleAuthUrl(`${ts}.${sig}`));
}
