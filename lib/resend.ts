import { Resend } from "resend";
import { sendViaSmtp, smtpConfigured } from "@/lib/smtp";
import { safeFrom } from "@/lib/mail-from";

const apiKey = process.env.RESEND_API_KEY;
// Locked to a @biztreck.world sender (defaults to connect@biztreck.world) so a
// misconfigured env can never make this app send "from" anything else.
const fromAddress = safeFrom(process.env.RESEND_FROM);
const adminEmail = process.env.ADMIN_EMAIL || "connect@biztreck.world";

let _resend: Resend | null = null;
function getResend() {
  if (!apiKey) throw new Error("RESEND_API_KEY missing");
  if (!_resend) _resend = new Resend(apiKey);
  return _resend;
}

// Once Resend reports its daily quota exhausted, skip it for a while and go
// straight to the SMTP fallback instead of retrying (and failing) per email.
let resendBlockedUntil = 0;
function resendUsable() {
  return Boolean(apiKey) && Date.now() >= resendBlockedUntil;
}

type SendResult = { ok: boolean; id?: string; error?: string; code?: string; via?: "resend" | "smtp" };

type ResendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
};

/** Raw Resend send. Never falls back — used internally by the wrappers below. */
async function resendSend(args: ResendArgs): Promise<SendResult> {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: fromAddress,
      to: args.to,
      subject: args.subject,
      html: args.html,
      replyTo: args.replyTo,
      ...(args.attachments && args.attachments.length ? { attachments: args.attachments } : {}),
    });
    if ((result as any)?.error) {
      const err = (result as any).error;
      const code = classifyResendError(err);
      if (code === "quota") resendBlockedUntil = Date.now() + 10 * 60 * 1000;
      return { ok: false, error: err?.message || "send failed", code };
    }
    return { ok: true, id: (result as any)?.data?.id, via: "resend" };
  } catch (err: any) {
    console.error("[resend] send failed:", err?.message || err);
    const code = classifyResendError(err);
    if (code === "quota") resendBlockedUntil = Date.now() + 10 * 60 * 1000;
    return { ok: false, error: err?.message || "send failed", code };
  }
}

/**
 * Send an email, preferring Resend and falling back to SMTP when Resend fails
 * (quota exhausted, rate limited, misconfigured, or offline). Returns `via` so
 * callers can see which transport delivered it.
 */
async function sendWithFallback(args: ResendArgs): Promise<SendResult> {
  // Prefer SMTP (e.g. Gmail) when configured so sent mail lands in the account's
  // own "Sent" folder — Gmail auto-saves messages sent via smtp.gmail.com. Set
  // PREFER_SMTP=false to go back to Resend-first.
  const preferSmtp =
    smtpConfigured() && String(process.env.PREFER_SMTP ?? "true").toLowerCase() !== "false";

  if (preferSmtp) {
    const s = await sendViaSmtp(args);
    if (s.ok) return { ok: true, id: s.id, via: "smtp" };
    // SMTP failed (rate limit / auth) — fall back to Resend if it's usable.
    if (resendUsable()) {
      const r = await resendSend(args);
      if (r.ok) return r;
      return {
        ok: false,
        error: `SMTP failed (${s.error}); Resend fallback also failed (${r.error})`,
        code: "other",
      };
    }
    return { ok: false, error: s.error, code: "other" };
  }

  if (resendUsable()) {
    const r = await resendSend(args);
    if (r.ok) return r;
    // Resend failed — try SMTP if it's configured.
    if (smtpConfigured()) {
      const s = await sendViaSmtp(args);
      if (s.ok) return { ok: true, id: s.id, via: "smtp" };
      return {
        ok: false,
        error: `Resend failed (${r.error}); SMTP fallback also failed (${s.error})`,
        code: "other",
      };
    }
    return r; // no SMTP fallback available (surfaces the Resend quota/auth code)
  }
  // Resend not configured (or temporarily blocked) — go straight to SMTP.
  if (smtpConfigured()) {
    const s = await sendViaSmtp(args);
    return s.ok ? { ok: true, id: s.id, via: "smtp" } : { ok: false, error: s.error, code: "other" };
  }
  return { ok: false, error: "No email transport configured (set RESEND_API_KEY or SMTP_*)", code: "other" };
}

type SendArgs = {
  subject: string;
  html: string;
  to?: string | string[];
  replyTo?: string;
};

export async function sendAdminEmail({ subject, html, to, replyTo }: SendArgs) {
  return sendWithFallback({ to: to || adminEmail, subject, html, replyTo });
}

type OutreachArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
};

/**
 * Send an outreach email to a lead. Replies go back to the admin inbox so the
 * business can respond directly. `attachments[].content` is a base64 string.
 * Uses Resend first, then SMTP as a fallback.
 */
export async function sendOutreachEmail({
  to,
  subject,
  html,
  replyTo,
  attachments,
}: OutreachArgs): Promise<SendResult> {
  return sendWithFallback({ to, subject, html, replyTo: replyTo || adminEmail, attachments });
}

/** Normalise Resend errors so callers can react (stop a batch on quota, back off on rate limit). */
export function classifyResendError(err: any): "quota" | "rate_limit" | "auth" | "other" {
  const name = String(err?.name || "").toLowerCase();
  const msg = String(err?.message || "").toLowerCase();
  const status = Number(err?.statusCode || err?.status || 0);
  if (name.includes("quota") || msg.includes("quota") || msg.includes("daily")) return "quota";
  if (name.includes("rate") || msg.includes("rate limit") || msg.includes("too many") || status === 429) return "rate_limit";
  if (status === 401 || status === 403 || msg.includes("unauthor") || msg.includes("not verified")) return "auth";
  return "other";
}

export function emailShell(title: string, body: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0b1224;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#2c52c4,#22d3ee);display:grid;place-items:center;color:#fff;font-weight:800;">B</div>
      <div>
        <div style="font-weight:700;color:#fff;font-size:16px;">Biztreck Solutions</div>
        <div style="font-size:11px;letter-spacing:.18em;color:#7fa2ff;text-transform:uppercase;">${escapeHtml(title)}</div>
      </div>
    </div>
    <div style="background:#0d1a3a;border:1px solid rgba(127,162,255,.18);border-radius:14px;padding:22px;line-height:1.55;color:#e2e8f0;font-size:14px;">
      ${body}
    </div>
    <div style="margin-top:18px;font-size:11px;color:#94a3b8;text-align:center;">
      Biztreck Solutions · Greater Noida, Delhi NCR (201306)<br/>
      connect@biztreck.world · +91 87408 63229
    </div>
  </div>
</body></html>`;
}

export function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
