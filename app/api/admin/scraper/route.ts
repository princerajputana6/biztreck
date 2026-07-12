import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import { normalizePlaces, runApifyScraper, type ScrapedPlace } from "@/lib/scraper";

export const runtime = "nodejs";
// The Apify run-sync call can take a while; give it room where the host allows it.
export const maxDuration = 300;

async function requireAdmin() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Upsert normalized places by placeId. Returns how many were new vs updated.
async function savePlaces(places: ScrapedPlace[]) {
  if (!places.length) return { inserted: 0, updated: 0 };
  const db = await getDb();
  const now = new Date();
  const ops = places.map((place) => ({
    updateOne: {
      filter: { placeId: place.placeId },
      update: {
        $set: { ...place, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      upsert: true,
    },
  }));
  const result = await db.collection("scraped_places").bulkWrite(ops, { ordered: false });
  const inserted = result.upsertedCount || 0;
  return { inserted, updated: places.length - inserted };
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const data = await req.json();
    const action = String(data?.action || "");
    const db = await getDb();

    if (action === "import-json") {
      // Accept either a raw array or { items: [...] } (both an Apify dataset
      // export and a { items } wrapper are common).
      const raw = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      const places = normalizePlaces(raw);
      if (!places.length) {
        return NextResponse.json(
          { ok: false, error: "No valid places found in the provided JSON." },
          { status: 400 }
        );
      }
      const { inserted, updated } = await savePlaces(places);
      return NextResponse.json({
        ok: true,
        message: `Imported ${places.length} places (${inserted} new, ${updated} updated).`,
        inserted,
        updated,
        total: places.length,
      });
    }

    if (action === "run-apify") {
      const searchStringsArray = String(data.searchStrings || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!searchStringsArray.length) {
        return NextResponse.json(
          { ok: false, error: "Enter at least one search term (one per line)." },
          { status: 400 }
        );
      }
      const rawItems = await runApifyScraper({
        searchStringsArray,
        locationQuery: String(data.location || "").trim() || undefined,
        maxCrawledPlacesPerSearch: Number(data.maxResults) || 20,
      });
      const places = normalizePlaces(rawItems);
      const { inserted, updated } = await savePlaces(places);
      return NextResponse.json({
        ok: true,
        message: places.length
          ? `Scraper finished: ${places.length} places (${inserted} new, ${updated} updated).`
          : "Scraper finished but returned no places. Try different search terms.",
        inserted,
        updated,
        total: places.length,
      });
    }

    if (action === "delete-place") {
      const placeId = String(data.placeId || "");
      if (!placeId) {
        return NextResponse.json({ ok: false, error: "placeId required" }, { status: 400 });
      }
      await db.collection("scraped_places").deleteOne({ placeId });
      return NextResponse.json({ ok: true });
    }

    if (action === "clear-all") {
      await db.collection("scraped_places").deleteMany({});
      return NextResponse.json({ ok: true, message: "All scraped places cleared." });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[admin:scraper]", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Scraper operation failed" },
      { status: 500 }
    );
  }
}
