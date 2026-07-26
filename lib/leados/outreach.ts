// LeadOS Module 8 — AI personalized outreach.
//
// Produces a full outreach kit for a lead — cold email, two follow-ups, a
// LinkedIn note, a discovery-call opener and a proposal summary — every piece
// referencing the lead's actual audit findings rather than generic sales copy.
// LLM-written when a key is configured, deterministically assembled otherwise.

import { complete, hasLLM, LLM_MODEL } from "@/lib/groq";
import type { Lead, LeadOutreach, OutreachEmail } from "./types";

const SENDER = { name: "Biztreck", contact: "connect@biztreck.world" };
// Human-facing sign-off — a real name/team, never an "[Your Name]" placeholder.
// Set OUTREACH_SENDER_NAME to your own name to personalise it.
const SENDER_NAME = process.env.OUTREACH_SENDER_NAME || "Biztreck Solutions";
const SENDER_CONTACT =
  process.env.FROM_EMAIL || process.env.RESEND_FROM || "connect@biztreck.world";

// Replace AI-looking bracket placeholders (e.g. "[Your Name]") with a real name.
function stripPlaceholders(text: string): string {
  return String(text || "")
    .replace(
      /\[\s*(your\s+name|your\s+full\s+name|full\s+name|name|sender(?:'s)?\s+name|rep\s+name|your\s+company|company\s+name)\s*\]/gi,
      SENDER_NAME
    )
    // Any leftover "[...]" directly under a sign-off line.
    .replace(
      /\n\s*(best regards|best|regards|thanks|cheers|sincerely)[,]?\s*\n\s*\[[^\]\n]*\]/gi,
      `\nBest regards,\n${SENDER_NAME}`
    );
}

function sanitizeEmail(e: OutreachEmail): OutreachEmail {
  return { subject: stripPlaceholders(e.subject), body: stripPlaceholders(e.body) };
}

// The concrete website problems to list in the audit-report email.
function leadIssues(lead: Lead): string[] {
  const fromAnalysis = (lead.analysis?.issues || []).filter(Boolean);
  if (fromAnalysis.length) return fromAnalysis.slice(0, 7);
  const fromAudit = (lead.audit?.sections || []).flatMap((s) => s.points).filter(Boolean);
  return fromAudit.slice(0, 7);
}

// The recommended fixes/solutions to list.
function leadSolutions(lead: Lead): string[] {
  const opps = (lead.opportunities || []).map((o) =>
    o.rationale ? `${o.service} — ${o.rationale}` : o.service
  );
  if (opps.length) return opps.slice(0, 6);
  return (lead.audit?.nextSteps || []).slice(0, 6);
}

/**
 * The cold email: a compact intro followed by the ACTUAL audit report — the
 * specific issues found and how we'd fix them — signed with a real name.
 * Built deterministically so it always contains the real findings and never an
 * "[Your Name]" placeholder.
 */
export function buildAuditReportEmail(lead: Lead): OutreachEmail {
  const name = lead.businessName || "your business";
  const score = lead.analysis?.score;
  const issues = leadIssues(lead);
  const solutions = leadSolutions(lead);
  const roi = lead.audit?.estimatedRoi;

  const parts: string[] = [];
  parts.push("Hi,");
  parts.push(
    `I ran a quick audit of ${name}'s website${
      score != null ? ` (it currently scores ${score}/100)` : ""
    } and wanted to share exactly what I found.`
  );
  if (issues.length) {
    parts.push(`**Issues we found:**\n${issues.map((i) => `- ${i}`).join("\n")}`);
  }
  if (solutions.length) {
    parts.push(`**What we'd do to fix it:**\n${solutions.map((s) => `- ${s}`).join("\n")}`);
  }
  if (roi) parts.push(`**Expected impact:** ${roi}`);
  parts.push(
    "I'm happy to send the full report or walk you through it on a quick 15-minute call — would this week suit you?"
  );
  parts.push(`Best regards,\n${SENDER_NAME}\n${SENDER_CONTACT}`);

  return {
    subject:
      issues.length > 0
        ? `${name}: website audit — ${issues.length} issue${issues.length === 1 ? "" : "s"} to fix`
        : `${name}: a quick website audit`,
    body: parts.join("\n\n"),
  };
}

// The concrete facts every message must be grounded in.
function outreachFacts(lead: Lead) {
  const audit = lead.audit;
  const topFindings =
    audit?.sections
      ?.flatMap((s) => s.points)
      .filter(Boolean)
      .slice(0, 4) ||
    lead.analysis?.issues?.slice(0, 4) ||
    [];
  return {
    business: {
      name: lead.businessName,
      category: lead.businessCategory,
      city: lead.city,
      country: lead.country,
      hasWebsite: Boolean(lead.website),
      websiteScore: lead.analysis?.score ?? null,
    },
    decisionMakers: lead.intel?.likelyDecisionMakers || [],
    priority: lead.scores?.priority || "cold",
    topOpportunities: (lead.opportunities || [])
      .slice(0, 3)
      .map((o) => ({ service: o.service, rationale: o.rationale })),
    auditHeadline: audit?.headline || "",
    auditExecutiveSummary: audit?.executiveSummary || "",
    topFindings,
    estimatedRoi: audit?.estimatedRoi || "",
    sender: SENDER,
  };
}

function firstFinding(lead: Lead): string {
  return (
    lead.audit?.sections?.flatMap((s) => s.points).find(Boolean) ||
    lead.analysis?.issues?.[0] ||
    (lead.website ? "a few quick wins on your website" : "not having a website yet")
  );
}

/** Deterministic outreach kit assembled from the computed data — no LLM. */
export function buildOutreachDeterministic(lead: Lead): LeadOutreach {
  const name = lead.businessName || "your business";
  const finding = firstFinding(lead);
  const opps = (lead.opportunities || []).slice(0, 3).map((o) => o.service);
  const oppList = opps.length ? opps.join(", ") : "a modern website and automation";
  const roi =
    lead.audit?.estimatedRoi ||
    "typically a 20–40% lift in qualified enquiries within two quarters";

  const coldEmail = buildAuditReportEmail(lead);

  const followUp1: OutreachEmail = {
    subject: `Re: ${name}: a quick idea`,
    body:
      `Hi again,\n\n` +
      `Just floating this back to the top of your inbox. The audit I shared for ${name} points to ${oppList} as the highest-return areas — ${roi}.\n\n` +
      `Want me to send the full report across?\n\nBest regards,\n${SENDER_NAME}`,
  };

  const followUp2: OutreachEmail = {
    subject: `Should I close the file on ${name}?`,
    body:
      `Hi,\n\n` +
      `I don't want to keep landing in your inbox. If improving ${name}'s online presence isn't a priority right now, no problem — just let me know and I'll leave it there.\n\n` +
      `If it is, reply and I'll send the audit plus a simple next step.\n\nBest regards,\n${SENDER_NAME}`,
  };

  const linkedin =
    `Hi — I help ${lead.businessCategory || "businesses"} like ${name} turn their website into a steady source of enquiries. ` +
    `I noticed ${finding} and put together a quick free audit. Open to a short chat?`;

  const discoveryOpener =
    `Thanks for taking the time. Before I dive in — I did a quick audit of ${name} and the standout was ${finding}. ` +
    `I'd love to understand how enquiries reach you today and where the friction is, then I can show you exactly where ${oppList} would move the needle. Sound good?`;

  const proposalSummary =
    `Proposal summary for ${name}\n\n` +
    `Findings: ${firstFinding(lead)}${lead.analysis ? ` (website scores ${lead.analysis.score}/100)` : ""}.\n` +
    `Recommended scope: ${oppList}.\n` +
    `Expected outcome: ${roi}.\n` +
    `Next step: a 15-minute discovery call to confirm priorities and timeline.`;

  return {
    generatedAt: new Date().toISOString(),
    source: "rules",
    coldEmail,
    followUp1,
    followUp2,
    linkedin,
    discoveryOpener,
    proposalSummary,
  };
}

function coerceEmail(raw: any, fb: OutreachEmail): OutreachEmail {
  if (!raw || typeof raw !== "object") return fb;
  return {
    subject: String(raw.subject || fb.subject).trim(),
    body: String(raw.body || fb.body).trim(),
  };
}

/**
 * Generate the outreach kit. LLM-written when a key is available (grounded in the
 * audit facts), deterministic otherwise. Never throws.
 */
export async function generateOutreach(lead: Lead, model?: string): Promise<LeadOutreach> {
  const fallback = buildOutreachDeterministic(lead);
  if (!hasLLM()) return fallback;

  const facts = outreachFacts(lead);
  const system =
    "You are an SDR at Biztreck writing outbound follow-ups to a prospect. You are given ONLY " +
    "verified facts and audit findings. Every message must reference a specific real finding — " +
    "never generic filler or invented claims. Warm, concise, human; no hype. Short (60-110 words), markdown. " +
    `End every email with "Best regards," then "${SENDER_NAME}" on a new line — NEVER a bracketed ` +
    "placeholder like [Your Name] or [Name]. Return STRICT JSON only:\n" +
    `{"followUp1":{"subject":string,"body":string},` +
    `"followUp2":{"subject":string,"body":string},` +
    `"linkedin":string (max 300 chars),` +
    `"discoveryOpener":string (2-4 sentences to open a call),` +
    `"proposalSummary":string (a tight paragraph)}`;

  try {
    const raw = await complete(system, JSON.stringify(facts), true, 0.7, model);
    const p = JSON.parse(raw);
    return {
      generatedAt: new Date().toISOString(),
      source: `openrouter:${LLM_MODEL}`,
      // The cold email is the audit report itself — built deterministically so it
      // always contains the real findings + a clean sign-off (no "[Your Name]").
      coldEmail: buildAuditReportEmail(lead),
      followUp1: sanitizeEmail(coerceEmail(p.followUp1, fallback.followUp1)),
      followUp2: sanitizeEmail(coerceEmail(p.followUp2, fallback.followUp2)),
      linkedin: stripPlaceholders(String(p.linkedin || fallback.linkedin).trim()),
      discoveryOpener: stripPlaceholders(String(p.discoveryOpener || fallback.discoveryOpener).trim()),
      proposalSummary: stripPlaceholders(String(p.proposalSummary || fallback.proposalSummary).trim()),
    };
  } catch {
    return fallback;
  }
}
