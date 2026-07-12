#!/usr/bin/env node
/**
 * Import an Apify "google-places" dataset JSON file into the scraped_places
 * collection. Deduplicates by placeId (upsert).
 *
 * Run:
 *   node --env-file=.env scripts/seed-places.mjs <path-to-dataset.json>
 *
 * Example:
 *   node --env-file=.env scripts/seed-places.mjs ~/Downloads/dataset_crawler-google-places.json
 *
 * Uses:
 *   MONGODB_URI required
 */
import { readFile } from "node:fs/promises";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const filePath = process.argv[2];

if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}
if (!filePath) {
  console.error("Usage: node --env-file=.env scripts/seed-places.mjs <path-to-dataset.json>");
  process.exit(1);
}

const str = (v) => (v == null ? "" : String(v).trim());
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

function normalizeAdditionalInfo(input) {
  if (!input || typeof input !== "object") return {};
  const out = {};
  for (const [group, entries] of Object.entries(input)) {
    if (!Array.isArray(entries)) continue;
    const rows = [];
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue;
      for (const [label, value] of Object.entries(entry)) {
        rows.push({ label: str(label), value: Boolean(value) });
      }
    }
    if (rows.length) out[str(group)] = rows;
  }
  return out;
}

function normalizePlace(raw) {
  if (!raw || typeof raw !== "object") return null;
  const title = str(raw.title);
  const placeId = str(raw.placeId) || str(raw.cid) || str(raw.fid) || "";
  if (!placeId && !title) return null;
  const categories = Array.isArray(raw.categories) ? raw.categories.map(str).filter(Boolean) : [];
  return {
    placeId: placeId || `title:${title.toLowerCase()}`,
    title,
    subTitle: str(raw.subTitle),
    description: str(raw.description),
    categoryName: str(raw.categoryName) || categories[0] || "Uncategorized",
    categories,
    price: str(raw.price),
    address: str(raw.address),
    neighborhood: str(raw.neighborhood),
    street: str(raw.street),
    city: str(raw.city),
    postalCode: str(raw.postalCode),
    state: str(raw.state),
    countryCode: str(raw.countryCode),
    website: str(raw.website),
    phone: str(raw.phone),
    phoneUnformatted: str(raw.phoneUnformatted),
    location: { lat: num(raw.location?.lat), lng: num(raw.location?.lng) },
    totalScore: num(raw.totalScore),
    reviewsCount: num(raw.reviewsCount) ?? 0,
    imagesCount: num(raw.imagesCount) ?? 0,
    imageUrl: str(raw.imageUrl),
    url: str(raw.url),
    permanentlyClosed: Boolean(raw.permanentlyClosed),
    temporarilyClosed: Boolean(raw.temporarilyClosed),
    claimThisBusiness: Boolean(raw.claimThisBusiness),
    openingHours: Array.isArray(raw.openingHours)
      ? raw.openingHours.map((h) => ({ day: str(h?.day), hours: str(h?.hours) })).filter((h) => h.day)
      : [],
    additionalInfo: normalizeAdditionalInfo(raw.additionalInfo),
    searchString: str(raw.searchString),
    scrapedAt: str(raw.scrapedAt) || new Date().toISOString(),
  };
}

const rawText = await readFile(filePath.replace(/^~/, process.env.HOME || "~"), "utf8");
const parsed = JSON.parse(rawText);
const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : [];

const seen = new Set();
const places = [];
for (const raw of items) {
  const p = normalizePlace(raw);
  if (!p || seen.has(p.placeId)) continue;
  seen.add(p.placeId);
  places.push(p);
}

if (!places.length) {
  console.error("No valid places found in the file.");
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("biztreck");
  const now = new Date();
  const ops = places.map((place) => ({
    updateOne: {
      filter: { placeId: place.placeId },
      update: { $set: { ...place, updatedAt: now }, $setOnInsert: { createdAt: now } },
      upsert: true,
    },
  }));
  const result = await db.collection("scraped_places").bulkWrite(ops, { ordered: false });
  await db.collection("scraped_places").createIndex({ placeId: 1 }, { unique: true });
  const inserted = result.upsertedCount || 0;
  console.log(`Imported ${places.length} places (${inserted} new, ${places.length - inserted} updated).`);
} finally {
  await client.close();
}
