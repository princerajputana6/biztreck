import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const db = await getDb();
  const job = await db.collection("jobs").findOne({ slug: params.slug });
  if (!job) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, job: { ...job, _id: String(job._id) } });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  await db.collection("jobs").deleteOne({ slug: params.slug });
  return NextResponse.json({ ok: true });
}
