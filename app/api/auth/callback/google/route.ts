import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { guardPermission } from "@/lib/auth";
import { emailFromIdToken, exchangeGoogleCode } from "@/lib/google";
import { saveGoogleTokens } from "@/lib/integrations-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validState(state: string): boolean {
  const [ts, sig] = state.split(".");
  if (!ts || !sig) return false;
  if (Date.now() - Number(ts) > 10 * 60 * 1000) return false; // 10-min window
  const expected = createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "x")
    .update(`google.${ts}`)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

// Google redirects here after consent (GOOGLE_REDIRECT_URI).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = url.origin;

  // Callback runs in the admin's browser — require the admin session too.
  if (!(await guardPermission("integrations"))) {
    return NextResponse.redirect(`${base}/admin/login`);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";
  if (!code || !validState(state)) {
    return NextResponse.redirect(`${base}/admin/integrations?error=google`);
  }

  try {
    const tok = await exchangeGoogleCode(code);
    await saveGoogleTokens({
      email: emailFromIdToken(tok.id_token || ""),
      refreshToken: tok.refresh_token,
      accessToken: tok.access_token,
      expiresIn: tok.expires_in,
    });
    return NextResponse.redirect(`${base}/admin/integrations?connected=google`);
  } catch (e) {
    console.error("[google callback]", e);
    return NextResponse.redirect(`${base}/admin/integrations?error=google`);
  }
}
