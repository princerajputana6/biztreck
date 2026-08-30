// LeadOS — source-adapter architecture.
//
// Every place leads come from (Google Maps, Product Hunt, a CSV upload, …) is
// an adapter that returns normalized `Lead` docs. The rest of the pipeline
// (enrichment, scoring, CRM) is source-agnostic. Adding a source means adding
// one file here and registering it — no changes to scoring or the UI wiring.

import type { Lead } from "../types";

export type SourceRunOptions = {
  /** Max leads to pull in this run. */
  limit?: number;
  /** For time-boxed feeds (launches, posts): how far back to look. */
  daysBack?: number;
  /** Free-text query / search terms (Google Maps, Reddit, …). */
  query?: string;
  /** Location parts (Google Maps). */
  location?: string;
  state?: string;
  country?: string;
};

export type SourceRunResult = {
  /** Normalized leads ready for `upsertLeads` (not yet enriched/scored). */
  leads: Lead[];
  /** How many raw records the source returned before mapping/filtering. */
  scanned: number;
  source: string;
};

export interface SourceAdapter {
  /** Stable id, also stored on the lead as its `source`. */
  id: string;
  label: string;
  /**
   * True when the source carries genuine buying-intent signals (funding,
   * launches, hiring). Google Maps is a directory (intent-blind); Product Hunt
   * is a launch feed (intent-rich).
   */
  intentSource: boolean;
  /** One line for the UI describing what this source pulls. */
  description: string;
  /** Whether the required credentials/config are present in this environment. */
  isConfigured(): boolean;
  run(opts: SourceRunOptions): Promise<SourceRunResult>;
}
