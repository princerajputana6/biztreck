import { getDb } from "@/lib/mongodb";
import {
  generateTrendingTopics,
  generateBlog,
  coverImageUrl,
  slugify,
} from "@/lib/groq";

export type AutoPublishResult = {
  durationMs: number;
  requested: number;
  topics: string[];
  inserted: { title: string; slug: string }[];
  failed: { topic: string; error: string }[];
};

/**
 * Core flow: discover N trending topics, generate full blog posts for each in
 * parallel, and insert them as published blogs. Used by both the cron job and
 * the admin "Auto-publish trending blogs" button.
 */
export async function autoPublishBlogs(
  count: number,
  source: "cron" | "admin"
): Promise<AutoPublishResult> {
  const startedAt = Date.now();
  const db = await getDb();
  const col = db.collection("blogs");

  // Pull recent titles + slugs to avoid duplicates
  const recent = await col
    .find({}, { projection: { title: 1, slug: 1 } })
    .sort({ createdAt: -1 })
    .limit(80)
    .toArray();
  const recentTitles = recent.map((r: any) => r.title).filter(Boolean);
  const existingSlugs = new Set(recent.map((r: any) => r.slug).filter(Boolean));

  // Discover topics
  const topics = await generateTrendingTopics(count, recentTitles);
  if (topics.length === 0) {
    throw new Error("No topics generated");
  }

  // Generate in parallel — one failure shouldn't kill the batch
  const results = await Promise.allSettled(
    topics.map(async (topic) => {
      const blog = await generateBlog(topic);
      let slug = slugify(blog.slug || blog.title);
      if (!slug) slug = `post-${Date.now()}`;
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }
      existingSlugs.add(slug);
      return { topic, blog: { ...blog, slug } };
    })
  );

  const now = new Date();
  const inserted: { title: string; slug: string }[] = [];
  const failed: { topic: string; error: string }[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      const { topic, blog } = r.value;
      try {
        await col.insertOne({
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          category: blog.category || "Engineering",
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          readMinutes: Number(blog.readMinutes) || 6,
          coverImage: coverImageUrl(blog.coverPrompt || blog.title),
          coverPrompt: blog.coverPrompt || "",
          contentMarkdown: blog.contentMarkdown,
          author: "Biztreck Editorial",
          published: true,
          source,
          createdAt: now,
          updatedAt: now,
        });
        inserted.push({ title: blog.title, slug: blog.slug });
      } catch (e: any) {
        failed.push({ topic, error: e?.message || "insert failed" });
      }
    } else {
      failed.push({
        topic: "(generation)",
        error: r.reason?.message || String(r.reason),
      });
    }
  }

  return {
    durationMs: Date.now() - startedAt,
    requested: count,
    topics,
    inserted,
    failed,
  };
}
