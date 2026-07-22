// LeadOS — persistence layer.
//
// Leads live in their own `leados_leads` collection rather than reusing
// `scraped_places`, so raw scrape output stays immutable and the enriched lead
// record can evolve independently.

import { getDb } from "@/lib/mongodb";
import type { Collection } from "mongodb";
import type { Lead, PipelineStage, TimelineEvent } from "./types";

export const LEADS = "leados_leads";

export async function leadsCollection(): Promise<Collection<Lead>> {
  const db = await getDb();
  return db.collection<Lead>(LEADS);
}

let indexesReady: Promise<void> | null = null;

/**
 * Create the indexes LeadOS needs. Without these, filtering and sorting a large
 * lead table degrades into collection scans and in-memory sorts.
 * Idempotent and cached per process.
 */
export function ensureLeadIndexes(): Promise<void> {
  if (!indexesReady) {
    indexesReady = (async () => {
      const col = await leadsCollection();
      await Promise.all([
        col.createIndex({ leadKey: 1 }, { unique: true }),
        col.createIndex({ "scores.overall": -1 }),
        col.createIndex({ "scores.priority": 1, "scores.overall": -1 }),
        col.createIndex({ stage: 1, updatedAt: -1 }),
        col.createIndex({ country: 1, businessCategory: 1 }),
        col.createIndex({ createdAt: -1 }),
        col.createIndex({ lastAnalyzedAt: 1 }),
        col.createIndex({ domain: 1 }),
        // Free-text search across the fields a salesperson actually types.
        col.createIndex(
          { businessName: "text", city: "text", businessCategory: "text" },
          { name: "lead_text" }
        ),
      ]);
    })().catch((err) => {
      // Don't cache a failure — retry on the next call.
      indexesReady = null;
      throw err;
    });
  }
  return indexesReady;
}

function hostOf(website: string): string {
  try {
    const u = new URL(
      /^https?:\/\//i.test(website) ? website : `https://${website}`
    );
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/** Build a Lead from a normalized scraped place (the existing scraper output). */
export function leadFromScrapedPlace(p: any, source = "google-places"): Lead | null {
  const businessName = String(p?.title || "").trim();
  const website = String(p?.website || "").trim();
  const placeId = String(p?.placeId || "").trim();
  const domain = hostOf(website);

  const leadKey = placeId || (domain ? `domain:${domain}` : "");
  if (!leadKey || !businessName) return null;

  const now = new Date().toISOString();

  return {
    leadKey,
    businessName,
    website,
    domain,
    googleUrl: String(p?.url || ""),
    email: String(p?.email || ""),
    phone: String(p?.phone || p?.phoneUnformatted || ""),
    address: String(p?.address || ""),
    city: String(p?.city || ""),
    state: String(p?.state || ""),
    postalCode: String(p?.postalCode || ""),
    country: countryFromCode(String(p?.countryCode || "")),
    countryCode: String(p?.countryCode || ""),
    lat: p?.location?.lat ?? null,
    lng: p?.location?.lng ?? null,
    googleRating: p?.totalScore ?? null,
    googleReviews: Number(p?.reviewsCount || 0),
    businessCategory: String(p?.categoryName || ""),
    categories: Array.isArray(p?.categories) ? p.categories.map(String) : [],
    description: String(p?.description || ""),
    logo: "",
    imageUrl: String(p?.imageUrl || ""),
    openingHours: Array.isArray(p?.openingHours) ? p.openingHours : [],
    socials: {},
    stage: "new",
    timeline: [
      {
        at: now,
        type: "created",
        summary: `Imported from ${source}`,
      },
    ],
    source,
    createdAt: now,
    updatedAt: now,
    lastAnalyzedAt: null,
  };
}

const COUNTRY_BY_CODE: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  UK: "United Kingdom",
  AU: "Australia",
  NZ: "New Zealand",
  SG: "Singapore",
  AE: "United Arab Emirates",
  IN: "India",
};

export function countryFromCode(code: string): string {
  return COUNTRY_BY_CODE[code.toUpperCase()] || code;
}

/** Insert leads that don't exist yet; never overwrite enrichment on re-import. */
export async function upsertLeads(leads: Lead[]) {
  if (!leads.length) return { inserted: 0, skipped: 0 };
  await ensureLeadIndexes();
  const col = await leadsCollection();

  const now = new Date().toISOString();
  const ops = leads.map((lead) => {
    // `updatedAt` is driven by $set on every import, so it must not also appear
    // in $setOnInsert — Mongo rejects the same path in two operators.
    const { updatedAt: _ignored, ...onInsert } = lead;
    return {
      updateOne: {
        filter: { leadKey: lead.leadKey },
        update: {
          $setOnInsert: onInsert,
          $set: { updatedAt: now },
        },
        upsert: true,
      },
    };
  });

  const res = await col.bulkWrite(ops, { ordered: false });
  const inserted = res.upsertedCount || 0;
  return { inserted, skipped: leads.length - inserted };
}

export async function getLeadByKey(leadKey: string): Promise<Lead | null> {
  const col = await leadsCollection();
  return col.findOne({ leadKey });
}

export async function addTimelineEvent(
  leadKey: string,
  event: TimelineEvent
) {
  const col = await leadsCollection();
  await col.updateOne(
    { leadKey },
    {
      $push: { timeline: event },
      $set: { updatedAt: new Date().toISOString() },
    } as never
  );
}

export async function setStage(leadKey: string, stage: PipelineStage) {
  const col = await leadsCollection();
  const now = new Date().toISOString();
  await col.updateOne(
    { leadKey },
    {
      $set: { stage, updatedAt: now },
      $push: {
        timeline: { at: now, type: "stage", summary: `Moved to ${stage}` },
      },
    } as never
  );
}
