// Shared portfolio/showcase types and pure helpers.
//
// The list of companies shown on the homepage and /portfolio is NOT hardcoded
// here anymore — it is derived from the admin `clients` collection (see
// lib/showcase.ts). This module only holds the display shape, the category
// labels, and small pure helpers that both the server loader and the client
// components can share.

export type Project = {
  name: string;
  slug: string;
  /** Matches a slug in lib/solutions.ts */
  category: string;
  tagline: string;
  description: string;
  logo?: string;
  tags: string[];
  status: string;
  url: string;
  accent: string;
  accentSoft: string;
  glow: string;
};

/** Category labels shown on tabs — keyed by solution slug. */
export const PROJECT_CATEGORY_LABELS: Record<string, string> = {
  "custom-software": "Custom Software",
  "ai-automation": "AI Automation",
  "business-automation": "Business Automation",
  "crm-development": "CRM",
  "erp-development": "ERP",
  "customer-portals": "Customer Portals",
  "vendor-portals": "Vendor Portals",
  "dashboard-development": "Dashboards",
  "website-development": "Websites",
};

/** Default category for a client that hasn't been assigned one in admin. */
export const DEFAULT_PROJECT_CATEGORY = "custom-software";

// A small palette so a company with no explicit colours still gets a distinct,
// stable accent (picked deterministically from its name/slug).
export const ACCENT_PALETTE: {
  accent: string;
  accentSoft: string;
  glow: string;
}[] = [
  { accent: "from-cyan-400 to-emerald-500", accentSoft: "rgba(34, 211, 238, 0.18)", glow: "rgba(34, 211, 238, 0.45)" },
  { accent: "from-blue-400 to-indigo-500", accentSoft: "rgba(96, 165, 250, 0.18)", glow: "rgba(96, 165, 250, 0.45)" },
  { accent: "from-violet-400 to-fuchsia-500", accentSoft: "rgba(167, 139, 250, 0.18)", glow: "rgba(167, 139, 250, 0.45)" },
  { accent: "from-pink-400 to-rose-500", accentSoft: "rgba(244, 114, 182, 0.18)", glow: "rgba(244, 114, 182, 0.45)" },
  { accent: "from-amber-400 to-orange-500", accentSoft: "rgba(251, 146, 60, 0.18)", glow: "rgba(251, 146, 60, 0.45)" },
  { accent: "from-emerald-400 to-cyan-500", accentSoft: "rgba(52, 211, 153, 0.18)", glow: "rgba(52, 211, 153, 0.45)" },
  { accent: "from-fuchsia-400 to-pink-500", accentSoft: "rgba(232, 121, 249, 0.18)", glow: "rgba(232, 121, 249, 0.45)" },
  { accent: "from-sky-400 to-blue-500", accentSoft: "rgba(56, 189, 248, 0.18)", glow: "rgba(56, 189, 248, 0.45)" },
  { accent: "from-orange-400 to-amber-500", accentSoft: "rgba(251, 146, 60, 0.18)", glow: "rgba(251, 146, 60, 0.45)" },
];

/** Deterministic accent pick so a given company always gets the same colours. */
export function accentFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ACCENT_PALETTE[h % ACCENT_PALETTE.length];
}

/** "https://www.TryLinqr.com/" -> "Trylinqr". Empty string if not derivable. */
export function deriveNameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "");
    const label = host.split(".")[0] || "";
    return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
  } catch {
    return "";
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Only categories that actually have projects, in a stable display order. */
export function projectCategories(projects: Project[]) {
  const order = Object.keys(PROJECT_CATEGORY_LABELS);
  const present = new Set(projects.map((p) => p.category));
  return order
    .filter((slug) => present.has(slug))
    .map((slug) => ({
      slug,
      label: PROJECT_CATEGORY_LABELS[slug] ?? slug,
      count: projects.filter((p) => p.category === slug).length,
    }));
}

export function projectsByCategory(projects: Project[], slug?: string) {
  if (!slug || slug === "all") return projects;
  return projects.filter((p) => p.category === slug);
}
