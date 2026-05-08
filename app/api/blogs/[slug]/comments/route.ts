import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = await getDb();
  const comments = await db
    .collection("comments")
    .find({ blogSlug: slug, approved: { $ne: false } })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
  return NextResponse.json({
    ok: true,
    comments: comments.map((c) => ({ ...c, _id: String(c._id) })),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }
    if (String(message).length > 2000) {
      return NextResponse.json(
        { ok: false, error: "Comment too long" },
        { status: 400 }
      );
    }
    const db = await getDb();
    const exists = await db.collection("blogs").findOne({ slug });
    if (!exists) {
      return NextResponse.json({ ok: false, error: "Blog not found" }, { status: 404 });
    }
    const doc = {
      blogSlug: slug,
      name: String(name).slice(0, 80),
      email: String(email).slice(0, 120),
      message: String(message),
      approved: true,
      createdAt: new Date(),
    };
    const r = await db.collection("comments").insertOne(doc);
    return NextResponse.json({
      ok: true,
      comment: { ...doc, _id: String(r.insertedId) },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
