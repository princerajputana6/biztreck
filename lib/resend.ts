import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM || "Biztreck <onboarding@resend.dev>";
const adminEmail = process.env.ADMIN_EMAIL || "connect@biztreck.world";

let _resend: Resend | null = null;
function getResend() {
  if (!apiKey) throw new Error("RESEND_API_KEY missing");
  if (!_resend) _resend = new Resend(apiKey);
  return _resend;
}

type SendArgs = {
  subject: string;
  html: string;
  to?: string | string[];
  replyTo?: string;
};

export async function sendAdminEmail({
  subject,
  html,
  to,
  replyTo,
}: SendArgs) {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: fromAddress,
      to: to || adminEmail,
      subject,
      html,
      replyTo,
    });
    return { ok: true, id: (result as any)?.data?.id };
  } catch (err: any) {
    console.error("[resend] send failed:", err?.message || err);
    return { ok: false, error: err?.message || "send failed" };
  }
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
