// A durable, inspectable record of every outreach email actually sent — so the
// user can verify what went out, to whom, when, and via which transport
// (Resend or the SMTP fallback), independent of any lead's timeline.
//
// Note: these emails are sent through Resend/SMTP, NOT the user's Gmail, so they
// do not appear in Gmail's "Sent" folder — this log (and the Resend dashboard)
// is where they're verifiable.

import { getDb } from "@/lib/mongodb";

export type SentEmailRecord = {
  to: string;
  from: string;
  subject: string;
  leadKey?: string;
  businessName?: string;
  messageId?: string;
  transport?: "resend" | "smtp";
  sentBy?: string;
  at?: string;
};

async function col() {
  const db = await getDb();
  const c = db.collection("sent_emails");
  c.createIndex({ at: -1 }).catch(() => {});
  return c;
}

/** Record a successful send. Never throws — logging must not break sending. */
export async function recordSentEmail(rec: SentEmailRecord): Promise<void> {
  try {
    const c = await col();
    await c.insertOne({
      ...rec,
      from: rec.from || process.env.RESEND_FROM || process.env.FROM_EMAIL || "",
      at: rec.at || new Date().toISOString(),
    });
  } catch (e) {
    console.error("[sent-log] record failed", e);
  }
}

/** Optional `sentBy` scopes the log to one user's sends (for non-admin members). */
export async function listSentEmails(limit = 50, sentBy?: string) {
  const c = await col();
  const filter = sentBy ? { sentBy } : {};
  return c
    .find(filter, { projection: { _id: 0 } })
    .sort({ at: -1 })
    .limit(Math.min(Math.max(limit, 1), 200))
    .toArray();
}

export async function countSentEmails(sentBy?: string): Promise<number> {
  const c = await col();
  return c.countDocuments(sentBy ? { sentBy } : {});
}
