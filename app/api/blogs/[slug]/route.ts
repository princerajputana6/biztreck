import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { guardPermission } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = await getDb();
  const blog = await db.collection("blogs").findOne({ slug });
  if (!blog) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, blog: { ...blog, _id: String(blog._id) } });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await guardPermission("content"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const db = await getDb();
  await db.collection("blogs").deleteOne({ slug });
  await db.collection("comments").deleteMany({ blogSlug: slug });
  return NextResponse.json({ ok: true });
}
