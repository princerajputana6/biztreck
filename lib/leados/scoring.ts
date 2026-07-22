// LeadOS Module 6 — opportunity scoring.
//
// Four independent 0–100 scores, then a weighted priority. Every score records
// the signals that produced it so a salesperson can see *why* a lead is hot
// rather than trusting an opaque number.

import type {
  BusinessIntel,
  Lead,
  LeadScores,
  Priority,
  WebsiteAnalysis,
} from "./types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const TARGET_COUNTRY_SET = new Set([
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "New Zealand",
  "Singapore",
  "United Arab Emirates",
]);

const FREE_EMAIL = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "live.com",
  "protonmail.com",
];

/**
 * Website opportunity: how much of a problem their site is.
 * Higher = more to sell. No website at all is the strongest signal.
 */
function websiteOpportunity(
  lead: Lead,
  a?: WebsiteAnalysis
): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  if (!lead.website || !a || !a.reachable) {
    signals.push("No working website (+40)");
    return { score: 40, signals };
  }

  if (a.responseMs != null && a.responseMs > 1500) {
    score += 20;
    signals.push(`Slow site — ${(a.responseMs / 1000).toFixed(1)}s (+20)`);
  }
  // "Outdated UI" proxied by dated platform or a poor overall analysis score.
  if (["Wix", "GoDaddy", "Joomla", "Drupal"].includes(a.cms) || a.score < 55) {
    score += 20;
    signals.push("Outdated or low-quality website (+20)");
  }
  if (!a.contactForm) {
    score += 10;
    signals.push("No contact form / weak CTA (+10)");
  }
  if (!a.https) {
    score += 10;
    signals.push("No SSL (+10)");
  }
  if (!a.viewportMeta) {
    score += 10;
    signals.push("Not mobile friendly (+10)");
  }
  if (!a.analytics) {
    score += 5;
    signals.push("No analytics (+5)");
  }

  return { score: clamp(score), signals };
}

function softwareOpportunity(
  lead: Lead,
  a?: WebsiteAnalysis,
  intel?: BusinessIntel
): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  const emp = intel?.estimatedEmployees || "";
  const inBand = /10|25|50|100|200|250/.test(emp);
  if (inBand) {
    score += 20;
    signals.push(`Employee band ${emp} (+20)`);
  }

  if (intel?.multipleLocations) {
    score += 20;
    signals.push("Multiple locations (+20)");
  }

  // No customer portal — inferred from absence of any login/account surface.
  const hasPortal =
    a?.technologies.some((t) => /portal/i.test(t)) ||
    /login|sign in|my account|client area/i.test(a?.title || "");
  if (!hasPortal) {
    score += 20;
    signals.push("No customer portal (+20)");
  }

  if (a && !a.bookingSystem) {
    score += 10;
    signals.push("Manual booking process (+10)");
  }

  if ((lead.categories?.length || 0) > 2) {
    score += 10;
    signals.push("Multiple service lines (+10)");
  }

  if (intel?.businessComplexity === "high") {
    score += 10;
    signals.push("High operational complexity (+10)");
  }

  return { score: clamp(score), signals };
}

function aiOpportunity(
  lead: Lead,
  a?: WebsiteAnalysis
): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  if (a && !a.chatWidget) {
    score += 20;
    signals.push("No chat widget (+20)");
  }
  // No FAQ automation — no FAQ/help surface detectable.
  if (a && !/faq|help|support|knowledge/i.test(a.title + a.metaDescription)) {
    score += 20;
    signals.push("No FAQ or self-serve support (+20)");
  }
  // Manual support — only phone/email as contact routes.
  if (a && (a.phoneLink || a.emailLink) && !a.chatWidget) {
    score += 20;
    signals.push("Support handled manually (+20)");
  }
  if ((lead.googleReviews || 0) > 100) {
    score += 10;
    signals.push("High review volume implies high enquiry volume (+10)");
  }

  return { score: clamp(score), signals };
}

function leadQuality(
  lead: Lead,
  intel?: BusinessIntel
): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  const email = (lead.email || "").toLowerCase();
  const domain = email.split("@")[1] || "";
  if (email && domain && !FREE_EMAIL.includes(domain)) {
    score += 20;
    signals.push("Business email address (+20)");
  } else if (email) {
    score += 5;
    signals.push("Free email address only (+5)");
  }

  if ((lead.contacts?.length || 0) > 0) {
    score += 20;
    signals.push("Decision maker identified (+20)");
  }

  // Company age proxy — review volume and rating suggest an established business.
  if ((lead.googleReviews || 0) >= 25) {
    score += 15;
    signals.push("Established business — 25+ reviews (+15)");
  }

  const socialCount = Object.values(lead.socials || {}).filter(Boolean).length;
  if (socialCount >= 2) {
    score += 10;
    signals.push("Active social presence (+10)");
  }

  if (lead.phone) {
    score += 10;
    signals.push("Phone number available (+10)");
  }

  if (TARGET_COUNTRY_SET.has(lead.country)) {
    score += 10;
    signals.push("In a target country (+10)");
  }

  if ((lead.googleRating || 0) >= 4) {
    score += 10;
    signals.push("Well-rated business (+10)");
  }

  return { score: clamp(score), signals };
}

function toPriority(overall: number, quality: number): Priority {
  if (quality < 25) return "ignore";
  if (overall >= 70) return "hot";
  if (overall >= 50) return "warm";
  if (overall >= 30) return "cold";
  return "ignore";
}

/**
 * Weighted priority. Lead quality dominates — a huge opportunity at a business
 * we cannot contact is worth less than a moderate one we can reach.
 */
export function scoreLead(lead: Lead): LeadScores {
  const a = lead.analysis;
  const intel = lead.intel;

  const web = websiteOpportunity(lead, a);
  const soft = softwareOpportunity(lead, a, intel);
  const ai = aiOpportunity(lead, a);
  const qual = leadQuality(lead, intel);

  const overall = clamp(
    qual.score * 0.4 + soft.score * 0.25 + ai.score * 0.2 + web.score * 0.15
  );

  return {
    website: web.score,
    software: soft.score,
    ai: ai.score,
    quality: qual.score,
    overall,
    priority: toPriority(overall, qual.score),
    signals: [
      ...web.signals,
      ...soft.signals,
      ...ai.signals,
      ...qual.signals,
    ],
  };
}

/** Map scores onto the services worth pitching (Module 5, rules-based baseline). */
export function deriveOpportunities(lead: Lead) {
  const a = lead.analysis;
  const out: { service: string; confidence: number; rationale: string }[] = [];
  const add = (service: string, confidence: number, rationale: string) =>
    out.push({ service, confidence: clamp(confidence), rationale });

  if (!lead.website || !a?.reachable)
    add("Website Redesign", 95, "No working website found for this business.");
  else {
    if (a.score < 60)
      add(
        "Website Redesign",
        85,
        `Website scores ${a.score}/100 — ${a.issues.slice(0, 2).join("; ")}.`
      );
    if (!a.metaDescription || !a.schema || !a.sitemap)
      add("SEO", 75, "Missing core SEO foundations (meta, schema or sitemap).");
    if (!a.chatWidget)
      add("AI Chatbot", 70, "No chat widget — enquiries rely on email or phone.");
    if (!a.chatWidget && (lead.googleReviews || 0) > 50)
      add(
        "AI Customer Support",
        72,
        "High customer volume handled without any self-serve support."
      );
    if (!a.bookingSystem)
      add("Booking System", 60, "No online booking — appointments taken manually.");
    if (!a.contactForm)
      add("Workflow Automation", 55, "No structured enquiry capture on the site.");
    if (["Wix", "GoDaddy", "Joomla"].includes(a.cms))
      add(
        "Legacy Modernization",
        65,
        `Running on ${a.cms}, which limits integration and scale.`
      );
  }

  if (lead.intel?.multipleLocations)
    add("ERP", 65, "Multiple locations usually mean fragmented operations data.");
  if ((lead.categories?.length || 0) > 2)
    add("CRM", 60, "Multiple service lines suggest a pipeline worth managing.");
  if ((lead.googleReviews || 0) > 100)
    add("Customer Portal", 62, "High customer volume with no self-service portal.");

  return out.sort((x, y) => y.confidence - x.confidence).slice(0, 8);
}
