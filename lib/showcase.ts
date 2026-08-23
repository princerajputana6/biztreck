import { getDb } from "@/lib/mongodb";
import {
  type Project,
  DEFAULT_PROJECT_CATEGORY,
  PROJECT_CATEGORY_LABELS,
  accentFor,
  deriveNameFromUrl,
  slugify,
} from "@/lib/projects";

// Shape of the optional website-showcase block we store on a client document.
// Every field is optional: a plain client (added through the admin form with
// just a company + website) still renders, just with sensible fallbacks.
type ShowcaseBlock = {
  show?: boolean;
  order?: number;
  slug?: string;
  category?: string;
  tagline?: string;
  description?: string;
  logo?: string;
  tags?: string[];
  status?: string;
};

/**
 * Turn an admin `clients` document into the Project card shape used by the
 * homepage and /portfolio. Anything not set on the client falls back to a
 * value derived from the website URL or a deterministic default, so cards never
 * render broken.
 */
export function clientToProject(client: any): Project {
  const sc: ShowcaseBlock = client?.showcase || {};
  const url = String(client?.websiteUrl || "").trim();
  const name =
    String(client?.company || "").trim() ||
    String(client?.name || "").trim() ||
    deriveNameFromUrl(url) ||
    "Untitled";

  const category =
    (sc.category && PROJECT_CATEGORY_LABELS[sc.category] ? sc.category : "") ||
    DEFAULT_PROJECT_CATEGORY;

  const accent = accentFor(sc.slug || name || url);

  return {
    name,
    slug: sc.slug || slugify(name) || slugify(url) || "client",
    category,
    tagline: String(sc.tagline || "").trim(),
    description: String(sc.description || "").trim(),
    logo: sc.logo ? String(sc.logo) : undefined,
    tags: Array.isArray(sc.tags) ? sc.tags.map(String) : [],
    status: String(sc.status || "Live").trim() || "Live",
    url: url || "#",
    accent: accent.accent,
    accentSoft: accent.accentSoft,
    glow: accent.glow,
  };
}

/**
 * Load the companies to show on the website, straight from the admin `clients`
 * collection. A client appears when it has a website URL and hasn't been
 * explicitly hidden (`showcase.show === false`). Ordered by `showcase.order`,
 * then newest first. Returns [] on any DB error so pages still render.
 */
export async function getShowcaseProjects(): Promise<Project[]> {
  try {
    const db = await getDb();
    const clients = await db
      .collection("clients")
      .find({
        websiteUrl: { $exists: true, $nin: ["", null] },
        "showcase.show": { $ne: false },
      })
      .limit(60)
      .toArray();

    // Sort in memory so clients without an explicit `showcase.order` (e.g. ones
    // added through the admin form) fall to the end instead of the front, and
    // ties break by newest first.
    clients.sort((a, b) => {
      const ao = Number.isFinite(a?.showcase?.order) ? a.showcase.order : Infinity;
      const bo = Number.isFinite(b?.showcase?.order) ? b.showcase.order : Infinity;
      if (ao !== bo) return ao - bo;
      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();
      return bt - at;
    });

    return clients.map(clientToProject);
  } catch {
    return [];
  }
}
