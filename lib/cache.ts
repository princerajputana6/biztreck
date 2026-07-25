// Lightweight in-memory TTL cache with namespaced, version-based invalidation.
//
// It fronts the expensive read paths (lead count aggregations, the portal
// overview) so repeated reads within a short window skip MongoDB entirely.
// Correctness comes first: any write to a namespace bumps its version, which
// instantly invalidates every cached entry under it — so a freshly-written
// value is never served stale. TTLs are just a safety net for entries no write
// touched.
//
// Scope: this is per-process (per serverless instance). For a single always-on
// server or dev that's ideal. On a multi-instance deployment each instance keeps
// its own cache — still correct (short TTL + version bump on that instance's
// writes), just not shared. Swap the Map for Upstash/Redis here if you outgrow
// that, keeping the same API.

type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();
const versions = new Map<string, number>();

// Cache on globalThis so Next.js dev hot-reloads and multiple route bundles
// share one instance instead of each building their own.
declare global {
  // eslint-disable-next-line no-var
  var _btCache: { store: Map<string, Entry>; versions: Map<string, number> } | undefined;
}
const g = globalThis._btCache || (globalThis._btCache = { store, versions });

function version(ns: string): number {
  return g.versions.get(ns) || 0;
}

/** Invalidate an entire namespace — every cached entry under it misses next read. */
export function invalidate(ns: string): void {
  g.versions.set(ns, version(ns) + 1);
}

/** Read-through cache: returns the cached value or computes, stores, and returns it. */
export async function cached<T>(
  ns: string,
  key: string,
  ttlMs: number,
  compute: () => Promise<T>
): Promise<T> {
  const full = `${ns}@${version(ns)}:${key}`;
  const hit = g.store.get(full);
  if (hit && hit.expires > Date.now()) return hit.value as T;

  const value = await compute();
  g.store.set(full, { value, expires: Date.now() + ttlMs });

  // Opportunistic sweep so stale/old-version entries don't grow unbounded.
  if (g.store.size > 400) {
    const now = Date.now();
    for (const [k, e] of g.store) if (e.expires <= now) g.store.delete(k);
  }
  return value;
}

/** Drop everything (used by tests / manual "clear cache"). */
export function clearCache(): void {
  g.store.clear();
  g.versions.clear();
}

// Namespaces used across the app, so callers don't pass loose strings.
export const CacheNS = {
  leads: "leads", // lead list counts / aggregates
  portal: "portal", // Shadow's company-wide overview
} as const;
