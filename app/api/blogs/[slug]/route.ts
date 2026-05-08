import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const db = await getDb();
  const blog = await db.collection("blogs").findOne({ slug: params.slug });
  if (!blog) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, blog: { ...blog, _id: String(blog._id) } });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  await db.collection("blogs").deleteOne({ slug: params.slug });
  await db.collection("comments").deleteMany({ blogSlug: params.slug });
  return NextResponse.json({ ok: true });
}
