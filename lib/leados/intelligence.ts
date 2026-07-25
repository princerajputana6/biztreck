// LeadOS Module 4 — business intelligence.
//
// Estimates the firmographics that opportunity scoring (Module 6) and the audit
// (Module 7) depend on: size, revenue band, maturity, likely decision makers,
// complexity. A free heuristic pass always runs; when a Groq key is present an
// LLM refines it. The LLM can only *override* fields it's confident about, so a
// bad completion never wipes the heuristic baseline.

import { complete, hasLLM } from "@/lib/groq";
import type { BusinessIntel, Lead } from "./types";

const MATURITY = new Set(["low", "medium", "high", "unknown"]);

function reviewsTier(reviews: number): 0 | 1 | 2 | 3 {
  if (reviews >= 500) return 3;
  if (reviews >= 150) return 2;
  if (reviews >= 40) return 1;
  return 0;
}

const EMPLOYEES_BY_TIER = ["1–10", "10–25", "25–100", "100–250"] as const;
const REVENUE_BY_TIER = [
  "< $1M",
  "$1M–$5M",
  "$5M–$20M",
  "$20M+",
] as const;

// A pragmatic map from a Google category to the decision makers worth naming in
// outreach. Falls back to a generic owner-led set.
function decisionMakers(category: string): string[] {
  const c = category.toLowerCase();
  if (/law|attorney|solicitor/.test(c)) return ["Managing Partner", "Practice Manager"];
  if (/clinic|dental|medical|health|hospital/.test(c))
    return ["Practice Owner", "Clinic Manager", "Operations Lead"];
  if (/construct|build|contractor|roofing|plumb|electric/.test(c))
    return ["Owner", "Operations Manager", "Project Director"];
  if (/restaurant|cafe|hotel|hospitality|bar/.test(c))
    return ["Owner", "General Manager", "Marketing Manager"];
  if (/real estate|realtor|property/.test(c))
    return ["Broker/Owner", "Marketing Manager"];
  if (/recruit|staffing|talent/.test(c)) return ["Director", "Head of Delivery"];
  if (/manufactur|industrial|factory/.test(c))
    return ["Managing Director", "Operations Manager", "IT Manager"];
  if (/school|education|academy|training/.test(c)) return ["Principal", "Director"];
  if (/logistic|freight|transport|shipping/.test(c))
    return ["Operations Director", "Fleet Manager"];
  return ["Owner", "Managing Director", "Marketing Manager"];
}

/** Deterministic, zero-cost estimate from scrape + website analysis signals. */
export function deriveIntelHeuristic(lead: Lead): BusinessIntel {
  const a = lead.analysis;
  const reviews = lead.googleReviews || 0;
  const tier = reviewsTier(reviews);

  const nameAndCats = `${lead.businessName} ${(lead.categories || []).join(" ")}`.toLowerCase();
  const multipleLocations =
    (lead.categories?.length || 0) > 3 ||
    /branch|locations|nationwide|multi-?site|franchise/.test(nameAndCats);

  // Digital maturity from the site: a good, instrumented site scores high.
  let digital: BusinessIntel["digitalMaturity"] = "unknown";
  if (a?.reachable) {
    if (a.score >= 75 && a.analytics) digital = "high";
    else if (a.score >= 50) digital = "medium";
    else digital = "low";
  } else if (lead.website) {
    digital = "low";
  } else {
    digital = "low";
  }

  // Technology maturity from detected stack.
  let tech: BusinessIntel["technologyMaturity"] = "unknown";
  if (a?.reachable) {
    if (a.framework || (a.technologies?.length || 0) >= 2) tech = "high";
    else if (["Wix", "GoDaddy", "Squarespace", "Joomla"].includes(a.cms)) tech = "low";
    else if (a.cms) tech = "medium";
    else tech = "low";
  }

  const complexity: BusinessIntel["businessComplexity"] =
    multipleLocations || (lead.categories?.length || 0) > 2 || tier >= 2
      ? tier >= 2 && multipleLocations
        ? "high"
        : "medium"
      : "low";

  const growthStage =
    tier >= 3 ? "Established" : tier >= 1 ? "Growing" : "Early / local";

  return {
    estimatedEmployees: EMPLOYEES_BY_TIER[tier],
    estimatedRevenueBand: REVENUE_BY_TIER[tier],
    industry: lead.businessCategory || (lead.categories || [])[0] || "Unknown",
    growthStage,
    multipleLocations,
    hiringActivity: false, // Requires a careers-page crawl — not yet inferred.
    technologyMaturity: tech,
    digitalMaturity: digital,
    likelyDecisionMakers: decisionMakers(lead.businessCategory || ""),
    businessComplexity: complexity,
  };
}

function coerceIntel(raw: any, base: BusinessIntel): BusinessIntel {
  if (!raw || typeof raw !== "object") return base;
  const str = (v: unknown, fb: string) => {
    const s = typeof v === "string" ? v.trim() : "";
    return s || fb;
  };
  const maturity = (v: unknown, fb: BusinessIntel["digitalMaturity"]) =>
    typeof v === "string" && MATURITY.has(v.toLowerCase())
      ? (v.toLowerCase() as BusinessIntel["digitalMaturity"])
      : fb;
  const makers = Array.isArray(raw.likelyDecisionMakers)
    ? raw.likelyDecisionMakers.map(String).filter(Boolean).slice(0, 5)
    : base.likelyDecisionMakers;

  return {
    estimatedEmployees: str(raw.estimatedEmployees, base.estimatedEmployees),
    estimatedRevenueBand: str(raw.estimatedRevenueBand, base.estimatedRevenueBand),
    industry: str(raw.industry, base.industry),
    growthStage: str(raw.growthStage, base.growthStage),
    multipleLocations:
      typeof raw.multipleLocations === "boolean"
        ? raw.multipleLocations
        : base.multipleLocations,
    hiringActivity:
      typeof raw.hiringActivity === "boolean" ? raw.hiringActivity : base.hiringActivity,
    technologyMaturity: maturity(raw.technologyMaturity, base.technologyMaturity),
    digitalMaturity: maturity(raw.digitalMaturity, base.digitalMaturity),
    likelyDecisionMakers: makers.length ? makers : base.likelyDecisionMakers,
    businessComplexity: maturity(
      raw.businessComplexity,
      base.businessComplexity
    ) as BusinessIntel["businessComplexity"],
  };
}

/**
 * Best-available intelligence for a lead. Heuristic baseline, refined by the LLM
 * when available. Never throws — falls back to the heuristic on any AI failure.
 */
export async function deriveIntel(lead: Lead, model?: string): Promise<BusinessIntel> {
  const base = deriveIntelHeuristic(lead);
  if (!hasLLM()) return base;

  const a = lead.analysis;
  const facts = {
    businessName: lead.businessName,
    category: lead.businessCategory,
    categories: (lead.categories || []).slice(0, 8),
    country: lead.country,
    city: lead.city,
    googleRating: lead.googleRating,
    googleReviews: lead.googleReviews,
    hasWebsite: Boolean(lead.website),
    websiteScore: a?.score ?? null,
    cms: a?.cms || null,
    framework: a?.framework || null,
    analytics: a?.analytics ?? null,
    description: (lead.description || "").slice(0, 400),
    heuristicBaseline: base,
  };

  const system =
    "You are a B2B market analyst estimating firmographics for outbound sales. " +
    "You are given scraped facts and a heuristic baseline. Return ONLY strict JSON " +
    "matching this schema — refine the baseline where the facts justify it, and keep " +
    "the baseline value when unsure:\n" +
    `{"estimatedEmployees": string (a range like "10–25"), "estimatedRevenueBand": string, ` +
    `"industry": string, "growthStage": string, "multipleLocations": boolean, ` +
    `"hiringActivity": boolean, "technologyMaturity": "low"|"medium"|"high"|"unknown", ` +
    `"digitalMaturity": "low"|"medium"|"high"|"unknown", "likelyDecisionMakers": string[], ` +
    `"businessComplexity": "low"|"medium"|"high"|"unknown"}`;

  try {
    const raw = await complete(system, JSON.stringify(facts), true, 0.3, model);
    return coerceIntel(JSON.parse(raw), base);
  } catch {
    return base;
  }
}
