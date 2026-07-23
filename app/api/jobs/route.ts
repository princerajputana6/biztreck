import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { guardPermission } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const jobs = await db
      .collection("jobs")
      .find({ active: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({
      ok: true,
      jobs: jobs.map((j) => ({ ...j, _id: String(j._id) })),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await guardPermission("content"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await req.json();
    const required = ["title", "slug", "shortDescription", "descriptionMarkdown"];
    for (const f of required) {
      if (!data?.[f])
        return NextResponse.json(
          { ok: false, error: `Missing ${f}` },
          { status: 400 }
        );
    }
    const db = await getDb();
    const exists = await db.collection("jobs").findOne({ slug: data.slug });
    if (exists) data.slug = `${data.slug}-${Date.now().toString(36).slice(-4)}`;
    const doc = {
      title: data.title,
      slug: data.slug,
      department: data.department || "Engineering",
      location: data.location || "Greater Noida, Delhi NCR (Hybrid)",
      type: data.type || "Full-time",
      experience: data.experience || "1-3 years",
      salary: data.salary || "Competitive",
      shortDescription: data.shortDescription,
      descriptionMarkdown: data.descriptionMarkdown,
      responsibilities: data.responsibilities || [],
      requirements: data.requirements || [],
      niceToHave: data.niceToHave || [],
      benefits: data.benefits || [],
      active: data.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const r = await db.collection("jobs").insertOne(doc);
    return NextResponse.json({ ok: true, id: String(r.insertedId), slug: doc.slug });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
