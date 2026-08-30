// LeadOS — the enrichment chain, shared by the API route and the maintenance
// cron. Runs website analysis → business intelligence → scoring → opportunities
// for a single lead and returns the fields to persist.

import { analyzeWebsite } from "./website-analysis";
import { deriveIntel } from "./intelligence";
import { computeProspectScores, deriveOpportunities, scoreLead } from "./scoring";
import { discoverDecisionMaker } from "./discovery";
import { findEmailForDomain } from "./hunter";
import type { Lead } from "./types";

export async function enrichLead(lead: Lead, opts?: { intelModel?: string }) {
  const analysis = lead.website ? await analyzeWebsite(lead.website) : undefined;
  const withAnalysis: Lead = { ...lead, analysis };

  // Phase 5 — discovery from the lead's own site: merge social links (only
  // filling gaps, never overwriting a source-provided handle), infer country
  // when the source didn't give one, and detect a click-to-chat WhatsApp link.
  const socials = { ...(analysis?.socialLinks || {}), ...lead.socials };
  const country = lead.country || analysis?.detectedCountry || "";
  const whatsappAvailable = lead.whatsappAvailable || Boolean(analysis?.whatsappLink);

  // Named decision-maker from About/Team pages — best-effort, only when we
  // don't already have one and the site is reachable.
  let founderName = lead.founderName || "";
  let decisionMakerTitle = lead.decisionMakerTitle || "";
  if (!founderName && analysis?.reachable && analysis.finalUrl) {
    const dm = await discoverDecisionMaker(analysis.finalUrl);
    if (dm.founderName) {
      founderName = dm.founderName;
      decisionMakerTitle = dm.decisionMakerTitle || "";
    }
  }

  const discovered: Lead = { ...withAnalysis, socials, country, whatsappAvailable, founderName, decisionMakerTitle };

  // Bulk callers can pass a fast model for the LLM intel step to keep big
  // batches quick; single-lead callers keep the default (higher-quality) model.
  const intel = await deriveIntel(discovered, opts?.intelModel);
  const scored: Lead = { ...discovered, intel };
  const scores = scoreLead(scored);
  const opportunities = deriveOpportunities(scored);
  // Prospecting layer — buying intent / premium / contactability + opportunity
  // classification, computed from the freshly-derived data.
  const prospect = computeProspectScores({ ...scored, scores, opportunities });
  // Only look up an email when the lead doesn't already have one.
  const email = !lead.email && lead.domain ? await findEmailForDomain(lead.domain) : "";
  return {
    analysis,
    intel,
    scores,
    opportunities,
    prospect,
    socials,
    country,
    whatsappAvailable,
    founderName,
    decisionMakerTitle,
    ...(email ? { email } : {}),
  };
}

/**
 * Run an async worker over `items` with a bounded number in flight at once.
 * Enrichment is I/O-bound (website fetch + LLM per lead), so processing a batch
 * a few at a time instead of strictly one-by-one turns minutes into seconds.
 */
export async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}
