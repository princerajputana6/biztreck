// LeadOS Module 13 — automation.
//
// Run on a schedule (see /api/cron/leados-maintenance):
//   1. Re-scan leads whose analysis has gone stale, so score/priority reflect
//      the site as it is today, not months ago.
//   2. Email an admin digest of high-priority leads that still haven't been
//      contacted, so hot opportunities don't rot in the pipeline.

import { leadsCollection } from "./db";
import { enrichLead } from "./enrich";
import { emailShell, escapeHtml, sendAdminEmail } from "@/lib/resend";

const DAY = 24 * 60 * 60 * 1000;

export type MaintenanceResult = {
  staleFound: number;
  rescanned: number;
  uncontacted: number;
  reminderSent: boolean;
};

export async function runMaintenance(
  opts: { rescanDays?: number; rescanLimit?: number } = {}
): Promise<MaintenanceResult> {
  const rescanDays = opts.rescanDays ?? 45;
  const rescanLimit = Math.min(opts.rescanLimit ?? 15, 50);
  const col = await leadsCollection();
  const now = Date.now();

  // 1) Re-scan the oldest stale leads (analysed, but longer ago than the window).
  const cutoff = new Date(now - rescanDays * DAY).toISOString();
  const stale = await col
    .find({ lastAnalyzedAt: { $lt: cutoff, $ne: null } })
    .sort({ lastAnalyzedAt: 1 })
    .limit(rescanLimit)
    .toArray();

  let rescanned = 0;
  for (const lead of stale) {
    try {
      const enrich = await enrichLead(lead);
      const iso = new Date().toISOString();
      await col.updateOne(
        { leadKey: lead.leadKey },
        {
          $set: { ...enrich, lastAnalyzedAt: iso, updatedAt: iso },
          $push: {
            timeline: {
              at: iso,
              type: "rescan",
              summary: `Automated re-scan — score ${enrich.analysis?.score ?? "n/a"}/100, priority ${enrich.scores.priority}`,
            },
          },
        } as never
      );
      rescanned++;
    } catch {
      // Mark attempted so one broken site doesn't get retried every run.
      await col.updateOne(
        { leadKey: lead.leadKey },
        { $set: { lastAnalyzedAt: new Date().toISOString() } }
      );
    }
  }

  // 2) High-priority leads not yet contacted, added more than 2 days ago.
  const staleContactCutoff = new Date(now - 2 * DAY).toISOString();
  const uncontacted = await col
    .find({
      "scores.priority": { $in: ["hot", "warm"] },
      stage: { $in: ["new", "qualified", "audit_generated"] },
      lastContactedAt: null, // matches missing field too
      createdAt: { $lt: staleContactCutoff },
    })
    .sort({ "scores.overall": -1 })
    .limit(25)
    .toArray();

  let reminderSent = false;
  if (uncontacted.length) {
    const rows = uncontacted
      .map((l) => {
        const cell = (v: string) =>
          `<td style="padding:6px 10px;border-bottom:1px solid rgba(127,162,255,.15)">${v}</td>`;
        return `<tr>${cell(escapeHtml(l.businessName))}${cell(
          `<span style="text-transform:capitalize">${escapeHtml(l.scores?.priority || "")}</span>`
        )}${cell(String(l.scores?.overall ?? "—"))}${cell(
          escapeHtml([l.city, l.country].filter(Boolean).join(", "))
        )}</tr>`;
      })
      .join("");
    const html = emailShell(
      "Leads waiting for outreach",
      `<p style="margin:0 0 12px">${uncontacted.length} high-priority lead(s) still haven't been contacted:</p>
       <table style="width:100%;border-collapse:collapse;font-size:13px">
         <tr style="text-align:left;color:#7fa2ff">
           <th style="padding:6px 10px">Business</th><th style="padding:6px 10px">Priority</th>
           <th style="padding:6px 10px">Score</th><th style="padding:6px 10px">Location</th>
         </tr>${rows}
       </table>
       <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">Open LeadOS to generate audits and send outreach.</p>`
    );
    const res = await sendAdminEmail({
      subject: `LeadOS: ${uncontacted.length} high-priority leads waiting for outreach`,
      html,
    });
    reminderSent = res.ok;
  }

  return {
    staleFound: stale.length,
    rescanned,
    uncontacted: uncontacted.length,
    reminderSent,
  };
}
