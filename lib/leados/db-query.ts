// A safe, read-only database query surface for the Shadow agent. Lets the agent
// answer arbitrary data questions (counts, lookups, filters) across the app
// WITHOUT hardcoding a tool per question — while blocking anything dangerous:
// only whitelisted collections, only find/count (never $where/JS eval), secrets
// and huge blobs projected out, results capped.

import { getDb } from "@/lib/mongodb";

const SAFE_COLLECTIONS = new Set([
  "leados_leads",
  "clients",
  "invoices",
  "employees",
  "applications",
  "blogs",
  "jobs",
  "contacts",
  "comments",
  "sent_emails",
  "hiring_pipeline",
  "social_tasks",
  "expenses",
  "scraped_places",
]);

// Never let a model-built filter run server-side JS or aggregation expressions.
const BANNED_KEYS = ["$where", "$function", "$accumulator", "$expr"];
// Fields that must never be returned (secrets) or that bloat the response.
const HIDE_FIELDS = [
  "passwordHash",
  "accessTokenEnc",
  "refreshTokenEnc",
  "config",
  "contentMarkdown",
];
const HEAVY_FIELDS = ["timeline", "analysis", "audit", "outreach", "milestones", "payments"];

function sanitize(f: any): any {
  if (!f || typeof f !== "object") return f;
  if (Array.isArray(f)) return f.map(sanitize);
  const out: any = {};
  for (const [k, v] of Object.entries(f)) {
    if (BANNED_KEYS.includes(k)) continue;
    out[k] = v && typeof v === "object" ? sanitize(v) : v;
  }
  return out;
}

export type DbQueryArgs = {
  collection: string;
  filter?: any;
  count?: boolean;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  fields?: string[];
};

export async function safeDbQuery(args: DbQueryArgs): Promise<any> {
  const name = String(args.collection || "").trim();
  if (!SAFE_COLLECTIONS.has(name)) {
    return {
      error: `"${name}" isn't queryable. Available: ${[...SAFE_COLLECTIONS].join(", ")}.`,
    };
  }
  const db = await getDb();
  const col = db.collection(name);
  const filter = sanitize(args.filter || {});

  if (args.count) {
    return { collection: name, count: await col.countDocuments(filter) };
  }

  const projection: Record<string, 0> = {};
  for (const f of HIDE_FIELDS) projection[f] = 0;
  const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 50);
  const sort = args.sort && typeof args.sort === "object" ? args.sort : { _id: -1 };

  const rows = await col.find(filter, { projection }).sort(sort as any).limit(limit).toArray();
  const total = await col.countDocuments(filter);

  const trimmed = rows.map((r: any) => {
    const o: any = { ...r, _id: r._id ? String(r._id) : undefined };
    if (Array.isArray(args.fields) && args.fields.length) {
      const picked: any = {};
      for (const f of args.fields) if (f in o) picked[f] = o[f];
      return picked;
    }
    for (const f of HEAVY_FIELDS) delete o[f];
    return o;
  });

  return { collection: name, total, returned: trimmed.length, rows: trimmed };
}
