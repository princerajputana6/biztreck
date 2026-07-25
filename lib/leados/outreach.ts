// LeadOS Module 8 — AI personalized outreach.
//
// Produces a full outreach kit for a lead — cold email, two follow-ups, a
// LinkedIn note, a discovery-call opener and a proposal summary — every piece
// referencing the lead's actual audit findings rather than generic sales copy.
// LLM-written when a key is configured, deterministically assembled otherwise.

import { complete, hasLLM, LLM_MODEL } from "@/lib/groq";
import type { Lead, LeadOutreach, OutreachEmail } from "./types";

const SENDER = { name: "Biztreck", contact: "connect@biztreck.world" };

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

  const coldEmail: OutreachEmail = {
    subject: `${name}: a quick idea after reviewing your online presence`,
    body:
      `Hi there,\n\n` +
      `I run growth projects at ${SENDER.name}. I took a quick look at ${name} and noticed **${finding}** — the kind of thing that quietly costs enquiries.\n\n` +
      `We put together a short, free audit of ${name} with a few specific fixes and opportunities (${oppList}). No obligation — I'm happy to send it over or walk you through it on a 15-minute call.\n\n` +
      `Would this week work for a quick chat?\n\n` +
      `Best,\n${SENDER.name}\n${SENDER.contact}`,
  };

  const followUp1: OutreachEmail = {
    subject: `Re: ${name}: a quick idea`,
    body:
      `Hi again,\n\n` +
      `Just floating this back to the top of your inbox. The audit I mentioned for ${name} points to ${oppList} as the highest-return areas — ${roi}.\n\n` +
      `Want me to send the full audit across?\n\nBest,\n${SENDER.name}`,
  };

  const followUp2: OutreachEmail = {
    subject: `Should I close the file on ${name}?`,
    body:
      `Hi,\n\n` +
      `I don't want to keep landing in your inbox. If improving ${name}'s online presence isn't a priority right now, no problem — just let me know and I'll leave it there.\n\n` +
      `If it is, reply and I'll send the audit plus a simple next step.\n\nThanks,\n${SENDER.name}`,
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
    "You are an SDR at Biztreck writing outbound to a prospect. You are given ONLY " +
    "verified facts and audit findings about their business. Every message must " +
    "reference a specific real finding — never generic filler, never invented " +
    "claims. Warm, concise, human; no hype. Emails are short (60-110 words), " +
    "markdown, and end with a soft CTA. Return STRICT JSON only:\n" +
    `{"coldEmail":{"subject":string,"body":string},` +
    `"followUp1":{"subject":string,"body":string},` +
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
      coldEmail: coerceEmail(p.coldEmail, fallback.coldEmail),
      followUp1: coerceEmail(p.followUp1, fallback.followUp1),
      followUp2: coerceEmail(p.followUp2, fallback.followUp2),
      linkedin: String(p.linkedin || fallback.linkedin).trim(),
      discoveryOpener: String(p.discoveryOpener || fallback.discoveryOpener).trim(),
      proposalSummary: String(p.proposalSummary || fallback.proposalSummary).trim(),
    };
  } catch {
    return fallback;
  }
}
