import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { guardPermission } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const blogs = await db
      .collection("blogs")
      .find({ published: true }, { projection: { contentMarkdown: 0 } })
      .sort({ createdAt: -1 })
      .limit(60)
      .toArray();
    return NextResponse.json({
      ok: true,
      blogs: blogs.map((b) => ({ ...b, _id: String(b._id) })),
    });
  } catch (e: any) {
    console.error("[blogs:list] failed", e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await guardPermission("content"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await req.json();
    const required = ["title", "slug", "excerpt", "contentMarkdown"];
    for (const f of required) {
      if (!data?.[f]) {
        return NextResponse.json(
          { ok: false, error: `Missing ${f}` },
          { status: 400 }
        );
      }
    }
    const db = await getDb();
    const exists = await db.collection("blogs").findOne({ slug: data.slug });
    if (exists) {
      data.slug = `${data.slug}-${Date.now().toString(36).slice(-4)}`;
    }
    const doc = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      category: data.category || "Engineering",
      tags: Array.isArray(data.tags) ? data.tags : [],
      readMinutes: Number(data.readMinutes) || 6,
      coverImage: data.coverImage || "",
      coverPrompt: data.coverPrompt || "",
      contentMarkdown: data.contentMarkdown,
      author: data.author || "Biztreck Editorial",
      published: data.published ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const r = await db.collection("blogs").insertOne(doc);
    return NextResponse.json({ ok: true, id: String(r.insertedId), slug: doc.slug });
  } catch (e: any) {
    console.error("[blogs:create] failed", e);
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
