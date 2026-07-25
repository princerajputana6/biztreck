// LeadOS — the enrichment chain, shared by the API route and the maintenance
// cron. Runs website analysis → business intelligence → scoring → opportunities
// for a single lead and returns the fields to persist.

import { analyzeWebsite } from "./website-analysis";
import { deriveIntel } from "./intelligence";
import { deriveOpportunities, scoreLead } from "./scoring";
import { findEmailForDomain } from "./hunter";
import type { Lead } from "./types";

export async function enrichLead(lead: Lead, opts?: { intelModel?: string }) {
  const analysis = lead.website ? await analyzeWebsite(lead.website) : undefined;
  const withAnalysis: Lead = { ...lead, analysis };
  // Bulk callers can pass a fast model for the LLM intel step to keep big
  // batches quick; single-lead callers keep the default (higher-quality) model.
  const intel = await deriveIntel(withAnalysis, opts?.intelModel);
  const scored: Lead = { ...withAnalysis, intel };
  const scores = scoreLead(scored);
  const opportunities = deriveOpportunities(scored);
  // Only look up an email when the lead doesn't already have one.
  const email = !lead.email && lead.domain ? await findEmailForDomain(lead.domain) : "";
  return { analysis, intel, scores, opportunities, ...(email ? { email } : {}) };
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
