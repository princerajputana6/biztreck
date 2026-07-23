// Hunter.io Domain Search — finds a real email at a lead's domain instead of
// guessing one from the name. Requires HUNTER_API_KEY.

export function hunterConfigured(): boolean {
  return Boolean(process.env.HUNTER_API_KEY);
}

/** Best email Hunter has on file for a domain, or "" if none/not configured. */
export async function findEmailForDomain(domain: string): Promise<string> {
  const d = String(domain || "").trim();
  if (!d || !hunterConfigured()) return "";
  try {
    const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(d)}&api_key=${process.env.HUNTER_API_KEY}&limit=5`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const json = await res.json();
    const emails: Array<{ value?: string; type?: string; confidence?: number }> = json?.data?.emails || [];
    if (!emails.length) return "";
    // Prefer a generic inbox (info@, contact@) when confident; otherwise the
    // highest-confidence personal email Hunter found.
    const generic = emails.find((e) => e.type === "generic" && (e.confidence || 0) >= 50);
    const best = generic || [...emails].sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
    return best?.value ? String(best.value).trim() : "";
  } catch {
    return "";
  }
}
