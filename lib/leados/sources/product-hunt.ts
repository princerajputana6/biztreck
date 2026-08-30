// LeadOS — Product Hunt source adapter.
//
// Product Hunt is a launch feed: every post is a product that JUST went live,
// which is a genuine buying-intent signal (unlike a Google Maps directory
// listing). We read the public GraphQL API (read-only, respects rate limits)
// and never scrape the site. Founders ("makers") and their public handles come
// straight from the API — nothing is fabricated.
//
// Requires PRODUCT_HUNT_TOKEN (a developer token from
// https://api.producthunt.com/v2/oauth/applications). When absent the adapter
// reports itself unconfigured and the UI hides the run button.

import type { Lead } from "../types";
import type { SourceAdapter, SourceRunOptions, SourceRunResult } from "./types";

const ENDPOINT = "https://api.producthunt.com/v2/api/graphql";
export const PRODUCT_HUNT_SOURCE = "product-hunt";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

type PHMaker = { name?: string; username?: string; twitterUsername?: string; websiteUrl?: string };
type PHNode = {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  url?: string;
  website?: string;
  votesCount?: number;
  createdAt?: string;
  topics?: { edges: { node: { name: string } }[] };
  makers?: PHMaker[];
};

const QUERY = `
query Launches($first: Int!, $after: String, $postedAfter: DateTime) {
  posts(order: NEWEST, first: $first, after: $after, postedAfter: $postedAfter) {
    edges {
      node {
        id name tagline description url website votesCount createdAt
        topics(first: 3) { edges { node { name } } }
        makers { name username twitterUsername websiteUrl }
      }
    }
    pageInfo { endCursor hasNextPage }
  }
}`;

/** Map one Product Hunt post to a normalized lead. Returns null if unusable. */
export function leadFromProductHunt(node: PHNode): Lead | null {
  const businessName = String(node.name || "").trim();
  if (!businessName) return null;

  // Prefer the product's own site; the makers' personal site is a fallback.
  const maker = (node.makers || [])[0] || {};
  const website = String(node.website || maker.websiteUrl || "").trim();
  const domain = hostOf(website);

  // Domain is the strongest cross-source key; fall back to the PH post id so a
  // website-less launch still imports (and can be deduped by name later).
  const leadKey = domain ? `domain:${domain}` : `producthunt:${node.id}`;

  const now = new Date().toISOString();
  const launchedAt = node.createdAt || now;
  const launchDay = launchedAt.slice(0, 10);
  const topics = (node.topics?.edges || []).map((e) => e.node?.name).filter(Boolean);
  const twitter = maker.twitterUsername
    ? `https://twitter.com/${String(maker.twitterUsername).replace(/^@/, "")}`
    : "";

  return {
    leadKey,
    businessName,
    website,
    domain,
    googleUrl: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    // Product Hunt does not expose a company's country — leave it unknown
    // rather than guessing (premium market scoring will simply not apply).
    country: "",
    countryCode: "",
    lat: null,
    lng: null,
    googleRating: null,
    googleReviews: 0,
    businessCategory: topics[0] || "",
    categories: topics,
    description: [node.tagline, node.description].filter(Boolean).join(" — "),
    logo: "",
    imageUrl: "",
    openingHours: [],
    socials: twitter ? { twitter } : {},
    // The intent-bearing signal: a fresh launch.
    launchSignals: [`Launched on Product Hunt on ${launchDay} (${node.votesCount || 0} votes)`],
    foundedYear: Number(launchedAt.slice(0, 4)) || undefined,
    founderName: maker.name || "",
    stage: "new",
    timeline: [{ at: now, type: "created", summary: "Imported from Product Hunt" }],
    source: PRODUCT_HUNT_SOURCE,
    sources: [{ source: PRODUCT_HUNT_SOURCE, sourceUrl: node.url || "", collectedAt: now }],
    createdAt: now,
    updatedAt: now,
    lastAnalyzedAt: null,
  };
}

async function fetchPage(
  token: string,
  first: number,
  after: string | null,
  postedAfter: string
): Promise<{ nodes: PHNode[]; endCursor: string | null; hasNextPage: boolean }> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: QUERY, variables: { first, after, postedAfter } }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Product Hunt API ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as any;
  if (json.errors?.length) {
    throw new Error(`Product Hunt API: ${json.errors[0]?.message || "query error"}`);
  }
  const conn = json.data?.posts;
  const nodes: PHNode[] = (conn?.edges || []).map((e: any) => e.node).filter(Boolean);
  return {
    nodes,
    endCursor: conn?.pageInfo?.endCursor || null,
    hasNextPage: Boolean(conn?.pageInfo?.hasNextPage),
  };
}

export const productHuntAdapter: SourceAdapter = {
  id: PRODUCT_HUNT_SOURCE,
  label: "Product Hunt",
  intentSource: true,
  description: "Recent product launches — high buying-intent, founder-led startups.",
  isConfigured() {
    return Boolean(process.env.PRODUCT_HUNT_TOKEN);
  },
  async run(opts: SourceRunOptions): Promise<SourceRunResult> {
    const token = process.env.PRODUCT_HUNT_TOKEN;
    if (!token) {
      throw new Error(
        "PRODUCT_HUNT_TOKEN is not set. Add a Product Hunt developer token to enable this source."
      );
    }
    const limit = Math.min(Math.max(Number(opts.limit) || 40, 1), 200);
    const daysBack = Math.min(Math.max(Number(opts.daysBack) || 7, 1), 90);
    const postedAfter = new Date(Date.now() - daysBack * 24 * 3600 * 1000).toISOString();

    const collected: PHNode[] = [];
    let after: string | null = null;
    // Page through NEWEST until we have `limit` posts or run out. Cap pages so a
    // misbehaving cursor can never loop forever.
    for (let page = 0; page < 15 && collected.length < limit; page++) {
      const first = Math.min(20, limit - collected.length);
      const { nodes, endCursor, hasNextPage } = await fetchPage(token, first, after, postedAfter);
      collected.push(...nodes);
      if (!hasNextPage || !endCursor) break;
      after = endCursor;
    }

    const leads = collected.map(leadFromProductHunt).filter(Boolean) as Lead[];
    return { leads, scanned: collected.length, source: PRODUCT_HUNT_SOURCE };
  },
};
