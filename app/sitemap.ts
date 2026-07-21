import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getDb } from "@/lib/mongodb";
import { SOLUTIONS } from "@/lib/solutions";
import { INDUSTRIES } from "@/lib/industries";

export const dynamic = "force-dynamic";

const staticRoutes = [
  "",
  "/about",
  "/solutions",
  ...SOLUTIONS.map((s) => `/solutions/${s.slug}`),
  "/industries",
  ...INDUSTRIES.map((i) => `/industries/${i.slug}`),
  "/case-studies",
  "/portfolio",
  "/faq",
  "/contact",
  "/resources",
  "/resources/business-audit",
  "/book-strategy-call",
  "/careers",
  "/blog",
  "/legal/privacy-policy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/refund",
  "/legal/security",
  "/legal/gdpr",
  "/legal/dpa",
  "/legal/aup",
];

async function getDynamicEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = await getDb();
    const [blogs, jobs] = await Promise.all([
      db
        .collection("blogs")
        .find({ published: true }, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } })
        .toArray(),
      db
        .collection("jobs")
        .find({ active: { $ne: false } }, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } })
        .toArray(),
    ]);

    return [
      ...blogs
        .filter((b: any) => b?.slug)
        .map((b: any) => ({
          url: `${SITE.url}/blog/${b.slug}`,
          lastModified: b.updatedAt || b.createdAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ...jobs
        .filter((j: any) => j?.slug)
        .map((j: any) => ({
          url: `${SITE.url}/careers/${j.slug}`,
          lastModified: j.updatedAt || j.createdAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        })),
    ];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dyn = await getDynamicEntries();
  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE.url}${r}`,
      lastModified: new Date(),
      changeFrequency: (r === "" ? "daily" : "monthly") as
        | "daily"
        | "monthly",
      priority: r === "" ? 1.0 : r.startsWith("/solutions") ? 0.9 : 0.6,
    })),
    ...dyn,
  ];
}
