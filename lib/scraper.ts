// Helpers for the Google Places scraper feature.
//
// The admin scraper imports business listings that come from the Apify
// "compass/crawler-google-places" actor (the same shape as the dataset JSON
// exported from an Apify run). Items are normalized to a compact document and
// stored in the `scraped_places` collection, deduplicated by placeId.

export type OpeningHour = { day: string; hours: string };

export type ScrapedPlace = {
  placeId: string;
  title: string;
  subTitle: string;
  description: string;
  categoryName: string;
  categories: string[];
  price: string;
  address: string;
  neighborhood: string;
  street: string;
  city: string;
  postalCode: string;
  state: string;
  countryCode: string;
  website: string;
  phone: string;
  phoneUnformatted: string;
  location: { lat: number | null; lng: number | null };
  totalScore: number | null;
  reviewsCount: number;
  imagesCount: number;
  imageUrl: string;
  url: string;
  permanentlyClosed: boolean;
  temporarilyClosed: boolean;
  claimThisBusiness: boolean;
  openingHours: OpeningHour[];
  additionalInfo: Record<string, { label: string; value: boolean }[]>;
  searchString: string;
  scrapedAt: string;
};

function str(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function num(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeOpeningHours(input: unknown): OpeningHour[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((h: any) => ({ day: str(h?.day), hours: str(h?.hours) }))
    .filter((h) => h.day);
}

// additionalInfo arrives as { "Service options": [{ "Takeout": true }, ...], ... }
// Flatten each entry into { label, value } so the UI can render it simply.
function normalizeAdditionalInfo(
  input: unknown
): Record<string, { label: string; value: boolean }[]> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, { label: string; value: boolean }[]> = {};
  for (const [group, entries] of Object.entries(input as Record<string, any>)) {
    if (!Array.isArray(entries)) continue;
    const rows: { label: string; value: boolean }[] = [];
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

/**
 * Normalize a single raw Apify google-places item into a ScrapedPlace.
 * Returns null when the item has no usable identity (no placeId and no title).
 */
export function normalizePlace(raw: any): ScrapedPlace | null {
  if (!raw || typeof raw !== "object") return null;
  const title = str(raw.title);
  const placeId =
    str(raw.placeId) || str(raw.cid) || str(raw.fid) || "";
  if (!placeId && !title) return null;

  const categories = Array.isArray(raw.categories)
    ? raw.categories.map(str).filter(Boolean)
    : [];
  const categoryName = str(raw.categoryName) || categories[0] || "Uncategorized";

  return {
    // Fall back to a title-based key so items without a placeId still dedupe.
    placeId: placeId || `title:${title.toLowerCase()}`,
    title,
    subTitle: str(raw.subTitle),
    description: str(raw.description),
    categoryName,
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
    location: {
      lat: num(raw.location?.lat),
      lng: num(raw.location?.lng),
    },
    totalScore: num(raw.totalScore),
    reviewsCount: num(raw.reviewsCount) ?? 0,
    imagesCount: num(raw.imagesCount) ?? 0,
    imageUrl: str(raw.imageUrl),
    url: str(raw.url),
    permanentlyClosed: Boolean(raw.permanentlyClosed),
    temporarilyClosed: Boolean(raw.temporarilyClosed),
    claimThisBusiness: Boolean(raw.claimThisBusiness),
    openingHours: normalizeOpeningHours(raw.openingHours),
    additionalInfo: normalizeAdditionalInfo(raw.additionalInfo),
    searchString: str(raw.searchString),
    scrapedAt: str(raw.scrapedAt) || new Date().toISOString(),
  };
}

export function normalizePlaces(rawItems: unknown): ScrapedPlace[] {
  if (!Array.isArray(rawItems)) return [];
  const seen = new Set<string>();
  const out: ScrapedPlace[] = [];
  for (const raw of rawItems) {
    const place = normalizePlace(raw);
    if (!place) continue;
    if (seen.has(place.placeId)) continue;
    seen.add(place.placeId);
    out.push(place);
  }
  return out;
}

export type ApifyRunInput = {
  searchStringsArray: string[];
  locationQuery?: string;
  maxCrawledPlacesPerSearch?: number;
  language?: string;
};

/**
 * Run the Apify google-places actor synchronously and return the dataset items.
 * Requires APIFY_TOKEN in the environment. The actor id can be overridden with
 * APIFY_ACTOR_ID (default: compass/crawler-google-places).
 */
export async function runApifyScraper(input: ApifyRunInput): Promise<any[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error(
      "APIFY_TOKEN is not set. Add it to your environment to run the scraper, or import a JSON dataset instead."
    );
  }
  const actor = (process.env.APIFY_ACTOR_ID || "compass/crawler-google-places").replace(
    "/",
    "~"
  );
  const endpoint = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${encodeURIComponent(
    token
  )}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      searchStringsArray: input.searchStringsArray,
      locationQuery: input.locationQuery || undefined,
      maxCrawledPlacesPerSearch: input.maxCrawledPlacesPerSearch || 20,
      language: input.language || "en",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Apify run failed (${res.status}). ${detail.slice(0, 300) || res.statusText}`
    );
  }

  const items = await res.json();
  return Array.isArray(items) ? items : [];
}
