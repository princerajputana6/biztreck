// LeadOS Module 6 — opportunity scoring.
//
// Four independent 0–100 scores, then a weighted priority. Every score records
// the signals that produced it so a salesperson can see *why* a lead is hot
// rather than trusting an opaque number.

import type {
  BudgetCategory,
  BusinessIntel,
  Lead,
  LeadScores,
  OpportunityCategory,
  PremiumTier,
  Priority,
  ProspectScores,
  WebsiteAnalysis,
} from "./types";
import { getScoreConfig } from "./scoring-config";

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
  const { priority } = getScoreConfig();
  if (quality < priority.ignoreQualityBelow) return "ignore";
  if (overall >= priority.hot) return "hot";
  if (overall >= priority.warm) return "warm";
  if (overall >= priority.cold) return "cold";
  return "ignore";
}

/**
 * Weighted priority. Lead quality dominates — a huge opportunity at a business
 * we cannot contact is worth less than a moderate one we can reach. The blend
 * comes from the (configurable) scoring config.
 */
export function scoreLead(lead: Lead): LeadScores {
  const a = lead.analysis;
  const intel = lead.intel;

  const web = websiteOpportunity(lead, a);
  const soft = softwareOpportunity(lead, a, intel);
  const ai = aiOpportunity(lead, a);
  const qual = leadQuality(lead, intel);

  const w = getScoreConfig().overall;
  const overall = clamp(
    qual.score * w.quality + soft.score * w.software + ai.score * w.ai + web.score * w.website
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

// ---- Prospecting scores (buying intent / premium / contactability) -----------

const HIGH_INCOME = new Set(["United States", "United Kingdom", "Australia", "Canada"]);
const B2B_TECH = /saas|software|technolog|it services|agency|marketing|consult|fintech|logistics|manufactur|real estate|profession|recruit|law|health/i;

const SERVICE_CATEGORY: Record<string, OpportunityCategory> = {
  "Website Redesign": "WEBSITE_REDESIGN",
  SEO: "SEO",
  CRM: "CRM",
  ERP: "ERP",
  HRMS: "HRMS",
  "Customer Portal": "CUSTOM_SOFTWARE",
  "Vendor Portal": "CUSTOM_SOFTWARE",
  "Inventory System": "CUSTOM_SOFTWARE",
  Dashboard: "CUSTOM_SOFTWARE",
  "Legacy Modernization": "CUSTOM_SOFTWARE",
  "API Integration": "CUSTOM_SOFTWARE",
  "Cloud Migration": "CUSTOM_SOFTWARE",
  "Booking System": "AUTOMATION",
  "Workflow Automation": "AUTOMATION",
  "Document Automation": "AUTOMATION",
  "Mobile App": "MOBILE_APP",
  "AI Chatbot": "AI_CHATBOT",
  "AI Customer Support": "AI_CHATBOT",
};

function toCategory(service: string): OpportunityCategory {
  return SERVICE_CATEGORY[service] || "CUSTOM_SOFTWARE";
}

/** Primary + secondary opportunity categories, derived from the opportunity list. */
export function classifyOpportunities(lead: Lead): {
  primary: OpportunityCategory;
  secondary: OpportunityCategory[];
} {
  const a = lead.analysis;
  const opps = (lead.opportunities && lead.opportunities.length
    ? lead.opportunities
    : deriveOpportunities(lead)) as { service: string; confidence: number }[];
  const cats: OpportunityCategory[] = [];
  if (!lead.website || (a && !a.reachable)) cats.push("WEBSITE");
  for (const o of [...opps].sort((x, y) => y.confidence - x.confidence)) {
    const c = toCategory(o.service);
    if (!cats.includes(c)) cats.push(c);
  }
  if (!cats.length) return { primary: "NO_CLEAR_OPPORTUNITY", secondary: [] };
  return { primary: cats[0], secondary: cats.slice(1, 4) };
}

/**
 * Buying-intent score (0–100). Distinct from technology need: a terrible website
 * with no sign of change scores LOW; a solid business that just raised / is
 * hiring / launching scores HIGH. Never fabricated — a plain Google-Maps lead
 * with no intent signals stays low and says so.
 */
function buyingIntent(lead: Lead): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;
  const intel = lead.intel;
  const now = Date.now();
  const monthsSince = (d?: string | null) => {
    if (!d) return Infinity;
    const t = new Date(d).getTime();
    return Number.isNaN(t) ? Infinity : (now - t) / (30 * 24 * 3600 * 1000);
  };
  const add = (pts: number, why: string) => {
    score += pts;
    signals.push(`${why} (+${pts})`);
  };

  if (lead.fundingStage || monthsSince(lead.lastFundingDate) <= 12) add(30, "Recently funded");
  const yr = new Date().getFullYear();
  if ((lead.launchSignals?.length || 0) > 0) add(25, "Recently launched");
  else if (lead.foundedYear && yr - lead.foundedYear <= 2) add(20, "Founded in the last 2 years");
  if ((lead.hiringSignals?.length || 0) > 0 || intel?.hiringActivity) add(20, "Currently hiring");
  if (intel?.multipleLocations || (lead.growthSignals || []).some((s) => /expand|new location|opening/i.test(s)))
    add(12, "Expanding");
  if (/startup|growing|scal/i.test(intel?.growthStage || "")) add(12, "Growth stage");
  const a = lead.analysis;
  if (a && a.reachable && a.analytics && (a.openGraph || /blog|news|resources/i.test(a.title + a.metaDescription)))
    add(8, "Actively marketing");

  if (!signals.length) signals.push("No buying-intent signals from this source yet");
  return { score: clamp(score), signals };
}

function premiumValue(lead: Lead): {
  score: number;
  tier: PremiumTier;
  signals: string[];
  budget: BudgetCategory;
} {
  const signals: string[] = [];
  let score = 0;
  const intel = lead.intel;
  const add = (pts: number, why: string) => {
    score += pts;
    signals.push(`${why} (+${pts})`);
  };

  if (HIGH_INCOME.has(lead.country)) add(25, "High-income market");
  else if (TARGET_COUNTRY_SET.has(lead.country)) add(15, "Target market");
  else if (lead.country) add(3, "Non-priority market");

  if (/50|100|200|250|500|1000/.test(intel?.estimatedEmployees || "")) add(20, "Larger team");
  else if (/10|25/.test(intel?.estimatedEmployees || "")) add(10, "Mid-size team");

  if (/(5M|10M|20M|50M|100M)/i.test(intel?.estimatedRevenueBand || "")) add(15, "Higher revenue band");
  if (lead.fundingStage || lead.fundingAmount) add(15, "Funded");
  if (B2B_TECH.test(lead.businessCategory || intel?.industry || "")) add(10, "B2B / tech-dependent");
  if (intel?.multipleLocations) add(10, "Multiple locations");
  if ((lead.analysis?.score || 0) >= 60) add(10, "Invests in its website");
  if ((lead.googleReviews || 0) >= 50) add(5, "Established (50+ reviews)");

  const s = clamp(score);
  const { premium } = getScoreConfig();
  const tier: PremiumTier = s >= premium.premiumAt ? "PREMIUM" : s >= premium.standardAt ? "STANDARD" : "LOW_VALUE";
  const budget: BudgetCategory = s === 0 ? "unknown" : tier === "PREMIUM" ? "high" : tier === "STANDARD" ? "medium" : "low";
  return { score: s, tier, signals, budget };
}

function contactability(lead: Lead): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;
  const add = (pts: number, why: string) => {
    score += pts;
    signals.push(`${why} (+${pts})`);
  };
  const socials = lead.socials || {};

  if (lead.founderName || lead.contacts?.some((c) => c.name)) add(30, "Decision maker identified");
  const email = (lead.email || "").toLowerCase();
  const domain = email.split("@")[1] || "";
  if (email && domain && !FREE_EMAIL.includes(domain)) add(20, "Business email");
  else if (email) add(8, "Personal email");
  if (socials.instagram) add(15, "Instagram found");
  if (socials.linkedin) add(12, "LinkedIn found");
  if (socials.facebook) add(8, "Facebook found");
  if (lead.whatsappAvailable) add(10, "WhatsApp available");
  else if (lead.phone) add(8, "Phone available");
  if (lead.analysis?.contactForm) add(5, "Website contact form");

  return { score: clamp(score), signals };
}

/** The full prospecting layer on top of the base scores. */
export function computeProspectScores(lead: Lead): ProspectScores {
  const intent = buyingIntent(lead);
  const premium = premiumValue(lead);
  const reach = contactability(lead);
  const { primary, secondary } = classifyOpportunities(lead);
  return {
    buyingIntentScore: intent.score,
    buyingIntentSignals: intent.signals,
    premiumScore: premium.score,
    premiumTier: premium.tier,
    premiumSignals: premium.signals,
    contactabilityScore: reach.score,
    contactabilitySignals: reach.signals,
    primaryOpportunity: primary,
    secondaryOpportunities: secondary,
    estimatedBudgetCategory: premium.budget,
  };
}
