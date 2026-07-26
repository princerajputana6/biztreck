// SMTP sender (nodemailer) — used as the fallback when Resend fails (e.g. its
// daily quota is hit). Configured via SMTP_HOST / SMTP_PORT / SMTP_USER /
// SMTP_PASS (+ optional SMTP_SECURE, SMTP_FROM).

import nodemailer, { type Transporter } from "nodemailer";

type SmtpArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
};

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT) || 587;
  // 465 = implicit TLS; 587/25 = STARTTLS. Derive from the port for the two
  // standard cases (avoids the common 587-with-secure:true connection hang);
  // honour SMTP_SECURE only for non-standard ports.
  const secure =
    port === 465 ? true : port === 587 || port === 25 ? false : String(process.env.SMTP_SECURE).toLowerCase() === "true";
  return { host, port, secure, auth: { user, pass } };
}

export function smtpConfigured(): boolean {
  return Boolean(smtpConfig());
}

declare global {
  // eslint-disable-next-line no-var
  var _btSmtpTransport: Transporter | undefined;
}

function getTransport(): Transporter | null {
  const cfg = smtpConfig();
  if (!cfg) return null;
  if (!globalThis._btSmtpTransport) {
    globalThis._btSmtpTransport = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.auth,
      requireTLS: !cfg.secure, // force STARTTLS on 587
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return globalThis._btSmtpTransport;
}

const smtpFrom =
  process.env.SMTP_FROM ||
  process.env.FROM_EMAIL ||
  process.env.RESEND_FROM ||
  process.env.SMTP_USER ||
  "connect@biztreck.world";

export async function sendViaSmtp(
  args: SmtpArgs
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const transport = getTransport();
  if (!transport) return { ok: false, error: "SMTP not configured" };
  try {
    const info = await transport.sendMail({
      from: smtpFrom,
      to: args.to,
      subject: args.subject,
      html: args.html,
      replyTo: args.replyTo,
      attachments: args.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        encoding: "base64",
      })),
    });
    return { ok: true, id: info.messageId };
  } catch (err: any) {
    console.error("[smtp] send failed:", err?.message || err);
    return { ok: false, error: err?.message || "SMTP send failed" };
  }
}
