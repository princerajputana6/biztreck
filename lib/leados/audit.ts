// LeadOS Module 7 — AI business audit.
//
// Turns a lead's hard analysis data (website checks, scores, detected
// opportunities, firmographics) into a client-ready audit report. The LLM writes
// the narrative but is *grounded* in the real findings we pass it, so it can't
// invent problems the site doesn't have. A deterministic assembler is used when
// no Groq key is configured, so an audit is always producible.

import { complete, hasLLM, LLM_MODEL } from "@/lib/groq";
import type { AuditSection, Lead, LeadAudit } from "./types";

const SECTION_ORDER = [
  "Website Analysis",
  "SEO Analysis",
  "Performance Analysis",
  "Security Review",
  "User Experience Review",
  "Conversion Opportunities",
  "AI Opportunities",
  "Automation Opportunities",
  "Custom Software Recommendations",
] as const;

// The concrete, non-hallucinated facts the report must be built from.
function auditFacts(lead: Lead) {
  const a = lead.analysis;
  return {
    business: {
      name: lead.businessName,
      category: lead.businessCategory,
      city: lead.city,
      country: lead.country,
      googleRating: lead.googleRating,
      googleReviews: lead.googleReviews,
      hasWebsite: Boolean(lead.website),
      website: lead.website || null,
    },
    intel: lead.intel || null,
    scores: lead.scores || null,
    opportunities: (lead.opportunities || []).map((o) => ({
      service: o.service,
      confidence: o.confidence,
      rationale: o.rationale,
    })),
    website: a
      ? {
          reachable: a.reachable,
          score: a.score,
          https: a.https,
          responseMs: a.responseMs,
          responsive: a.responsive,
          viewportMeta: a.viewportMeta,
          title: a.title,
          metaDescription: a.metaDescription,
          h1Count: a.h1Count,
          schema: a.schema,
          openGraph: a.openGraph,
          sitemap: a.sitemap,
          robotsTxt: a.robotsTxt,
          contactForm: a.contactForm,
          bookingSystem: a.bookingSystem,
          chatWidget: a.chatWidget,
          analytics: a.analytics,
          cms: a.cms,
          framework: a.framework,
          securityHeaders: a.securityHeaders,
          missingSecurityHeaders: a.missingSecurityHeaders,
          imagesMissingAlt: a.imagesMissingAlt,
          issues: a.issues,
        }
      : null,
  };
}

function section(title: string, summary: string, points: string[]): AuditSection {
  return { title, summary, points: points.filter(Boolean) };
}

/** Deterministic audit assembled from the computed data — no LLM required. */
export function buildAuditDeterministic(lead: Lead): LeadAudit {
  const a = lead.analysis;
  const s = lead.scores;
  const name = lead.businessName;
  const noSite = !lead.website || !a?.reachable;

  const opps = lead.opportunities || [];
  const oppLine = (svc: string) => opps.find((o) => o.service === svc)?.rationale;

  const sections: AuditSection[] = [
    section(
      "Website Analysis",
      noSite
        ? `${name} has no working website we could reach — the single biggest gap and opportunity.`
        : `${name}'s website scores ${a?.score}/100 on our automated checks.`,
      noSite
        ? ["No reachable website found", "Prospects and search engines have nothing to land on"]
        : (a?.issues || []).slice(0, 5)
    ),
    section(
      "SEO Analysis",
      noSite ? "With no site, the business is invisible to organic search." : "Search-visibility fundamentals:",
      noSite
        ? ["No indexable pages", "Zero organic discovery"]
        : [
            a?.metaDescription ? "Meta description present" : "Missing meta description",
            a?.schema ? "Structured data present" : "No schema.org structured data",
            a?.sitemap ? "sitemap.xml found" : "No sitemap.xml",
            a?.robotsTxt ? "robots.txt found" : "No robots.txt",
            a?.openGraph ? "Open Graph tags present" : "No Open Graph tags (poor link previews)",
          ]
    ),
    section(
      "Performance Analysis",
      noSite
        ? "Not applicable until a site exists."
        : a?.responseMs != null
          ? `Homepage responded in ${(a.responseMs / 1000).toFixed(1)}s.`
          : "Response time could not be measured.",
      noSite
        ? []
        : [
            a && a.responseMs != null && a.responseMs > 1500
              ? "Slower than the 1.5s users expect"
              : "Response time within acceptable range",
            a?.imagesMissingAlt ? `${a.imagesMissingAlt} images missing alt text` : "",
          ]
    ),
    section(
      "Security Review",
      noSite ? "Not applicable." : a?.https ? "Served over HTTPS." : "Served without HTTPS — browsers flag it as not secure.",
      noSite
        ? []
        : [
            a?.https ? "Valid TLS in place" : "No SSL / HTTPS",
            (a?.securityHeaders?.length || 0) > 0
              ? `Security headers set: ${a?.securityHeaders.join(", ")}`
              : "No security headers configured",
            (a?.missingSecurityHeaders?.length || 0) > 0
              ? `Missing: ${a?.missingSecurityHeaders.join(", ")}`
              : "",
          ]
    ),
    section(
      "User Experience Review",
      noSite ? "No experience to review." : "How easily a visitor can act:",
      noSite
        ? []
        : [
            a?.viewportMeta ? "Mobile viewport set" : "Not mobile-friendly (no viewport meta)",
            a?.contactForm ? "Contact form present" : "No contact form",
            a?.chatWidget ? "Live chat present" : "No live chat",
            a?.bookingSystem ? "Online booking present" : "No online booking",
          ]
    ),
    section(
      "Conversion Opportunities",
      "Where enquiries are being lost today:",
      [
        !a?.contactForm ? "Add a structured enquiry form to capture leads" : "",
        !a?.chatWidget ? "Add live/AI chat to answer buyers instantly" : "",
        !a?.bookingSystem ? "Add online booking to remove phone-tag friction" : "",
        !a?.analytics ? "Install analytics to see where visitors drop off" : "",
      ]
    ),
    section(
      "AI Opportunities",
      `AI opportunity score: ${s?.ai ?? 0}/100.`,
      [
        oppLine("AI Chatbot") || (!a?.chatWidget ? "AI chatbot to handle first-line enquiries" : ""),
        oppLine("AI Customer Support") || "",
        "Automated FAQ / self-serve support to deflect repetitive questions",
      ]
    ),
    section(
      "Automation Opportunities",
      `Software opportunity score: ${s?.software ?? 0}/100.`,
      [
        oppLine("Workflow Automation") || "Automate manual enquiry-to-quote handoffs",
        lead.intel?.multipleLocations ? "Unify data across locations" : "",
        oppLine("Document Automation") || "",
      ]
    ),
    section(
      "Custom Software Recommendations",
      "Systems worth building given the business profile:",
      opps
        .filter((o) =>
          ["CRM", "ERP", "Customer Portal", "Vendor Portal", "Inventory System", "Booking System", "HRMS", "Dashboard", "Mobile App"].includes(
            String(o.service)
          )
        )
        .map((o) => `${o.service} — ${o.rationale}`)
    ),
  ];

  const topOpps = opps.slice(0, 3).map((o) => o.service).join(", ");
  return {
    generatedAt: new Date().toISOString(),
    source: "rules",
    headline: noSite
      ? `${name} is invisible online — a ground-up web presence is the fastest win.`
      : `${name}'s site scores ${a?.score}/100 — clear room to convert more visitors.`,
    executiveSummary: noSite
      ? `${name} operates without a working website, which caps credibility and inbound enquiries. The strongest immediate opportunity is a modern, conversion-focused site${topOpps ? `, followed by ${topOpps}` : ""}.`
      : `Our automated audit of ${name} found a website scoring ${a?.score}/100 with concrete gaps in ${(a?.issues || []).slice(0, 2).join(" and ") || "several areas"}. The highest-value opportunities are ${topOpps || "website and conversion improvements"}.`,
    sections: sections.map((sec) => ({ ...sec, points: sec.points.filter(Boolean) })),
    estimatedRoi:
      "A modern site plus automated enquiry capture typically lifts qualified inbound by 20–40% within two quarters; automation of manual workflows commonly returns 5–15 hours/week of staff time.",
    nextSteps: [
      "Book a 20-minute discovery call to confirm priorities",
      noSite ? "Approve a redesign/build scope and timeline" : "Approve a prioritized fix + improvement scope",
      "Kick off with the highest-ROI item first",
    ],
    callToAction: `Reply to book a short call and we'll walk ${name} through a prioritized plan — no obligation.`,
    websiteScore: a?.score ?? 0,
    priority: s?.priority ?? "cold",
  };
}

function coerceSections(raw: any): AuditSection[] {
  const arr = Array.isArray(raw) ? raw : [];
  const byTitle = new Map<string, AuditSection>();
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const title = String(item.title || "").trim();
    if (!title) continue;
    byTitle.set(title.toLowerCase(), {
      title,
      summary: String(item.summary || "").trim(),
      points: Array.isArray(item.points)
        ? item.points.map((p: unknown) => String(p).trim()).filter(Boolean).slice(0, 8)
        : [],
    });
  }
  // Preserve the canonical order; keep any extras the model added at the end.
  const ordered: AuditSection[] = [];
  for (const t of SECTION_ORDER) {
    const found = byTitle.get(t.toLowerCase());
    if (found) {
      ordered.push(found);
      byTitle.delete(t.toLowerCase());
    }
  }
  return [...ordered, ...byTitle.values()];
}

/**
 * Generate the audit. LLM-written when a Groq key is available (grounded in the
 * lead's real analysis), otherwise deterministically assembled. Never throws.
 */
export async function generateAudit(lead: Lead, model?: string): Promise<LeadAudit> {
  const fallback = buildAuditDeterministic(lead);
  if (!hasLLM()) return fallback;

  const facts = auditFacts(lead);
  const system =
    "You are a senior digital consultant at Biztreck, writing a business audit that " +
    "will be sent to the prospect. You are given ONLY verified facts about their " +
    "business and website. Write specifically and honestly — reference the actual " +
    "findings, never invent problems that aren't in the data. Persuasive but not " +
    "salesy. Return STRICT JSON only:\n" +
    `{"headline": string, "executiveSummary": string (3-5 sentences), ` +
    `"sections": [{"title": string, "summary": string, "points": string[]}] ` +
    `(one object for each of: ${SECTION_ORDER.join(", ")}), ` +
    `"estimatedRoi": string, "nextSteps": string[], "callToAction": string}`;

  try {
    const raw = await complete(system, JSON.stringify(facts), true, 0.6, model);
    const parsed = JSON.parse(raw);
    const sections = coerceSections(parsed.sections);
    if (sections.length < 3) return fallback; // Too thin — trust the assembler.
    return {
      generatedAt: new Date().toISOString(),
      source: `openrouter:${LLM_MODEL}`,
      headline: String(parsed.headline || fallback.headline).trim(),
      executiveSummary: String(parsed.executiveSummary || fallback.executiveSummary).trim(),
      sections,
      estimatedRoi: String(parsed.estimatedRoi || fallback.estimatedRoi).trim(),
      nextSteps: Array.isArray(parsed.nextSteps)
        ? parsed.nextSteps.map((n: unknown) => String(n).trim()).filter(Boolean).slice(0, 6)
        : fallback.nextSteps,
      callToAction: String(parsed.callToAction || fallback.callToAction).trim(),
      websiteScore: lead.analysis?.score ?? 0,
      priority: lead.scores?.priority ?? "cold",
    };
  } catch {
    return fallback;
  }
}
