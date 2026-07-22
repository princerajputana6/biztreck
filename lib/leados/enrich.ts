// LeadOS — the enrichment chain, shared by the API route and the maintenance
// cron. Runs website analysis → business intelligence → scoring → opportunities
// for a single lead and returns the fields to persist.

import { analyzeWebsite } from "./website-analysis";
import { deriveIntel } from "./intelligence";
import { deriveOpportunities, scoreLead } from "./scoring";
import type { Lead } from "./types";

export async function enrichLead(lead: Lead) {
  const analysis = lead.website ? await analyzeWebsite(lead.website) : undefined;
  const withAnalysis: Lead = { ...lead, analysis };
  const intel = await deriveIntel(withAnalysis);
  const scored: Lead = { ...withAnalysis, intel };
  const scores = scoreLead(scored);
  const opportunities = deriveOpportunities(scored);
  return { analysis, intel, scores, opportunities };
}
