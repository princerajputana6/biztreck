// LeadOS — Google Maps source adapter.
//
// A thin adapter over the existing Apify Google Places scraper, so Google Maps
// participates in the same source-adapter interface as newer sources. The
// proven scraping/normalization code in lib/scraper.ts is reused as-is.

import { normalizePlaces, runApifyScraper } from "@/lib/scraper";
import { leadFromScrapedPlace } from "../db";
import type { Lead } from "../types";
import type { SourceAdapter, SourceRunOptions, SourceRunResult } from "./types";

export const GOOGLE_MAPS_SOURCE = "google-places-search";

export const googleMapsAdapter: SourceAdapter = {
  id: GOOGLE_MAPS_SOURCE,
  label: "Google Maps",
  // A directory listing carries no funding/launch/hiring signal, so it is
  // intent-blind — good for reach + premium, not for buying intent.
  intentSource: false,
  description: "Local business directory by search term + location. Broad reach, intent-blind.",
  isConfigured() {
    return Boolean(process.env.APIFY_TOKEN);
  },
  async run(opts: SourceRunOptions): Promise<SourceRunResult> {
    const searchStringsArray = String(opts.query || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!searchStringsArray.length) {
      throw new Error("Enter at least one search term (one per line).");
    }
    const locationQuery =
      [opts.location, opts.state, opts.country].map((s) => String(s || "").trim()).filter(Boolean).join(", ") ||
      undefined;

    const rawItems = await runApifyScraper({
      searchStringsArray,
      locationQuery,
      maxCrawledPlacesPerSearch: Math.min(Number(opts.limit) || 20, 100),
    });
    const places = normalizePlaces(rawItems);
    const leads = places
      .map((p) => leadFromScrapedPlace(p, GOOGLE_MAPS_SOURCE))
      .filter(Boolean) as Lead[];
    return { leads, scanned: places.length, source: GOOGLE_MAPS_SOURCE };
  },
};
