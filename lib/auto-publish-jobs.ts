import { getDb } from "@/lib/mongodb";
import { generateInDemandRoles, generateJob, slugify } from "@/lib/groq";

export type AutoPublishJobsResult = {
  durationMs: number;
  requested: number;
  roles: { role: string; notes?: string }[];
  inserted: { title: string; slug: string }[];
  failed: { role: string; error: string }[];
};

/**
 * Core flow: discover N in-demand role briefs, expand each into a full job
 * posting via Groq, and insert as active jobs. Shared between the admin
 * "Auto-publish trending roles" button and any future cron.
 */
export async function autoPublishJobs(
  count: number,
  source: "cron" | "admin"
): Promise<AutoPublishJobsResult> {
  const startedAt = Date.now();
  const db = await getDb();
  const col = db.collection("jobs");

  const recent = await col
    .find({}, { projection: { title: 1, slug: 1 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  const recentTitles = recent.map((r: any) => r.title).filter(Boolean);
  const existingSlugs = new Set(recent.map((r: any) => r.slug).filter(Boolean));

  const briefs = await generateInDemandRoles(count, recentTitles);
  if (briefs.length === 0) {
    throw new Error("No role briefs generated");
  }

  const results = await Promise.allSettled(
    briefs.map(async (brief) => {
      const job = await generateJob(brief);
      let slug = slugify(job.slug || job.title);
      if (!slug) slug = `role-${Date.now()}`;
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }
      existingSlugs.add(slug);
      return { brief, job: { ...job, slug } };
    })
  );

  const now = new Date();
  const inserted: { title: string; slug: string }[] = [];
  const failed: { role: string; error: string }[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      const { brief, job } = r.value;
      try {
        await col.insertOne({
          title: job.title,
          slug: job.slug,
          department: job.department || "Engineering",
          location: job.location || "Greater Noida, Delhi NCR (Hybrid)",
          type: job.type || "Full-time",
          experience: job.experience || "1-3 years",
          salary: job.salary || "Competitive",
          shortDescription: job.shortDescription,
          descriptionMarkdown: job.descriptionMarkdown,
          responsibilities: Array.isArray(job.responsibilities)
            ? job.responsibilities
            : [],
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          niceToHave: Array.isArray(job.niceToHave) ? job.niceToHave : [],
          benefits: Array.isArray(job.benefits) ? job.benefits : [],
          active: true,
          source,
          createdAt: now,
          updatedAt: now,
        });
        inserted.push({ title: job.title, slug: job.slug });
      } catch (e: any) {
        failed.push({ role: brief.role, error: e?.message || "insert failed" });
      }
    } else {
      failed.push({
        role: "(generation)",
        error: r.reason?.message || String(r.reason),
      });
    }
  }

  return {
    durationMs: Date.now() - startedAt,
    requested: count,
    roles: briefs.map((b) => ({ role: b.role, notes: b.notes })),
    inserted,
    failed,
  };
}
